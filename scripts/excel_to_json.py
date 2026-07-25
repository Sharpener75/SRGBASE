#!/usr/bin/env python3
"""Convert Excel source files to JSON for SRGBASE frontend.
Idempotent — safe to re-run. Outputs to src/data/.
Run from repo root: python scripts/excel_to_json.py
"""
import json
import os
import re
import math
import random
import openpyxl

# Max NS records per volcano file (keeps file sizes manageable for the browser)
NS_CAP_PER_FILE = 15000

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
OUT_DIR  = os.path.join(ROOT, 'src', 'data')

TISSUE_MAP = {'HT': 'Hypothalamus', 'HP': 'Pituitary', 'OV': 'Ovary'}
SAMPLE_LABEL_MAP = {
    'HP-16': 'Pituitary 16w',    'HP-35': 'Pituitary 35w',
    'HT-16': 'Hypothalamus 16w', 'HT-35': 'Hypothalamus 35w',
    'OV-16': 'Ovary 16w',        'OV-35': 'Ovary 35w',
}
SNCNA_TYPES = ['miRNA', 'piRNA', 'tsRNA', 'rsRNA']
TISSUES = ['Hypothalamus', 'Pituitary', 'Ovary']
TIMEPOINTS = ['16w', '35w']

# Ordered tissue×timepoint combos as they appear in bar-chart sheets
COMBO_LABELS = [
    ('Hypothalamus', '16w'), ('Pituitary', '16w'), ('Ovary', '16w'),
    ('Hypothalamus', '35w'), ('Pituitary', '35w'), ('Ovary', '35w'),
]


def norm_tissue(raw) -> str:
    s = str(raw or '').strip()
    if s in TISSUE_MAP:
        return TISSUE_MAP[s]
    # Handle "HT-16", "HP-35", etc.
    parts = s.split('-')
    if parts[0].upper() in TISSUE_MAP:
        return TISSUE_MAP[parts[0].upper()]
    lo = s.lower()
    if 'hypothalamus' in lo: return 'Hypothalamus'
    if 'pituitary' in lo or 'hypoph' in lo: return 'Pituitary'
    if 'ovar' in lo: return 'Ovary'
    return s


def norm_time(raw) -> str:
    s = str(raw or '').strip()
    if '16' in s: return '16w'
    if '35' in s: return '35w'
    return s


def norm_sample(raw) -> str:
    """Map sample codes like 'HP-16' → 'Pituitary 16w'."""
    s = str(raw or '').strip()
    if s in SAMPLE_LABEL_MAP:
        return SAMPLE_LABEL_MAP[s]
    # Try constructing from tissue + timepoint
    t = norm_tissue(s)
    tp = norm_time(s)
    if t in TISSUES and tp in TIMEPOINTS:
        return f'{t} {tp}'
    return s


def safe_float(v, default=0.0) -> float:
    try:
        return float(v) if v is not None else default
    except (TypeError, ValueError):
        return default


def safe_int(v, default=0) -> int:
    try:
        return int(float(v)) if v is not None else default
    except (TypeError, ValueError):
        return default


def ws_rows(ws):
    return [[c.value for c in row] for row in ws.iter_rows()]


def find_type_cols(header_row: list) -> dict:
    """Return {type: col_idx} from a header row."""
    result = {}
    for j, v in enumerate(header_row):
        s = str(v or '').lower().replace('-', '').replace('_', '').replace(' ', '')
        if 'mirna' in s and 'miRNA' not in result:
            result['miRNA'] = j
        elif 'pirna' in s and 'piRNA' not in result:
            result['piRNA'] = j
        elif 'tsrna' in s and 'tsRNA' not in result:
            result['tsRNA'] = j
        elif 'rsrna' in s and 'rsRNA' not in result:
            result['rsRNA'] = j
    return result


def write_json(name: str, data) -> None:
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    cnt = len(data) if isinstance(data, list) else 'object'
    print(f'  ✓ {name:<55} [{cnt}]')


# ─────────────────────────────────────────────────────────────────────────────
# 1. overview.json  ←  封面概况.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def parse_overview():
    wb = openpyxl.load_workbook(os.path.join(DATA_DIR, '封面概况.xlsx'), data_only=True)
    sheet_names = [ws.title for ws in wb.worksheets]
    print(f'    封面概况.xlsx sheets: {sheet_names}')

    # ── Sheet 柱状图: count data ──────────────────────────────────────────
    ws_bar = wb.worksheets[0]
    rows = ws_rows(ws_bar)

    # Find header row containing type names
    type_cols = {}
    data_start = 0
    for i, row in enumerate(rows[:6]):
        tc = find_type_cols(row)
        if len(tc) >= 2:
            type_cols = tc
            data_start = i + 1
            break

    if not type_cols:
        # No header found — assume: col0=tissue, col1=miRNA, col2=piRNA, col3=tsRNA, col4=rsRNA
        type_cols = {'miRNA': 1, 'piRNA': 2, 'tsRNA': 3, 'rsRNA': 4}

    print(f'    柱状图: type_cols={type_cols}  data_start={data_start}')

    hpo_callouts = {t: {'16w': {k: 0 for k in SNCNA_TYPES},
                        '35w': {k: 0 for k in SNCNA_TYPES}}
                    for t in TISSUES}

    def parse_block(block_rows, timepoint):
        for row in block_rows:
            if not any(v for v in row if v is not None):
                continue
            # Identify tissue from row label (first non-None cell typically)
            tissue = None
            for v in row:
                if v:
                    t = norm_tissue(str(v))
                    if t in TISSUES:
                        tissue = t
                        break
            if not tissue:
                continue
            for tp, j in type_cols.items():
                if j < len(row):
                    hpo_callouts[tissue][timepoint][tp] = safe_int(row[j])

    # Plan: rows 1–3 = 16w; rows 6–8 = 35w (1-indexed → slice relative to data_start)
    parse_block(rows[data_start:data_start + 3], '16w')
    parse_block(rows[data_start + 5:data_start + 8], '35w')

    # ── Sheet 饼状图: read distribution percentages ─────────────────────
    ws_pie = wb.worksheets[1]
    pie_rows = ws_rows(ws_pie)
    print(f'    饼状图: {len(pie_rows)} rows × {len(pie_rows[0]) if pie_rows else 0} cols')

    # Find type column mapping in pie sheet
    pie_type_cols = {}
    pie_data_start = 0
    for i, row in enumerate(pie_rows[:5]):
        tc = find_type_cols(row)
        if len(tc) >= 2:
            pie_type_cols = tc
            pie_data_start = i + 1
            break

    if not pie_type_cols:
        pie_type_cols = {'miRNA': 1, 'piRNA': 2, 'tsRNA': 3, 'rsRNA': 4}

    # Plan: row 1 = read counts, row 3 = percentages (relative to data section)
    # Use percentages (row index 2 from data start = plan row 3)
    read_dist = {'miRNA': 0.0, 'piRNA': 0.0, 'tsRNA': 0.0, 'rsRNA': 0.0}
    pct_row_idx = pie_data_start + 2  # plan row 3
    if pct_row_idx < len(pie_rows):
        row = pie_rows[pct_row_idx]
        for t, j in pie_type_cols.items():
            if j < len(row):
                read_dist[t] = round(safe_float(row[j]), 6)
    else:
        # Fallback: use first data row, normalize to proportion
        if pie_data_start < len(pie_rows):
            row = pie_rows[pie_data_start]
            total = sum(safe_float(row[j]) for j in pie_type_cols.values() if j < len(row))
            for t, j in pie_type_cols.items():
                if j < len(row) and total > 0:
                    read_dist[t] = round(safe_float(row[j]) / total, 6)

    # Compute totalSncRNAs
    total_sncnas = sum(
        hpo_callouts[tissue][tp][t]
        for tissue in TISSUES
        for tp in TIMEPOINTS
        for t in SNCNA_TYPES
    )

    result = {
        'totalSncRNAs': total_sncnas,
        'tissues': 3,
        'timepoints': 2,
        'libraries': 12,
        'hpoCallouts': hpo_callouts,
        'readDistribution': read_dist,
    }
    write_json('overview.json', result)
    print(f'    totalSncRNAs={total_sncnas}  readDist={read_dist}')
    # Sanity: Hypothalamus/16w/miRNA
    ht16_mirna = hpo_callouts.get('Hypothalamus', {}).get('16w', {}).get('miRNA', 'MISSING')
    print(f'    [verify] Hypothalamus 16w miRNA = {ht16_mirna}  (expect 275)')


# ─────────────────────────────────────────────────────────────────────────────
# 2. categories_counts.json + length_distribution.json  ←  sncRNA_categories.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def parse_categories():
    wb = openpyxl.load_workbook(os.path.join(DATA_DIR, 'sncRNA_categories.xlsx'), data_only=True)
    sheet_names = [ws.title for ws in wb.worksheets]
    print(f'    sncRNA_categories.xlsx sheets: {sheet_names}')

    # ── Sheet 1: SncRNA categories 柱状图 (5×7) ──────────────────────────
    ws_bar = wb.worksheets[0]
    rows = ws_rows(ws_bar)
    print(f'    柱状图: {len(rows)} rows × {len(rows[0]) if rows else 0} cols')

    # Expected: header row with combo labels, then 4 type rows
    # Format: [type_label, HT-16, HP-16, OV-16, HT-35, HP-35, OV-35]
    # OR:     [type_label, combo1, combo2, ..., combo6]
    counts = []

    # Find the header row (contains tissue/timepoint labels or numeric counts)
    combo_cols = {}  # {(tissue, timepoint): col_idx}

    # First try: look for row with sample labels
    header_idx = 0
    for i, row in enumerate(rows[:4]):
        # Check if this row has combo-style labels
        labels = [str(v or '').strip() for v in row[1:] if v]
        if any('-' in l or 'Week' in l for l in labels):
            header_idx = i
            # Parse column → (tissue, timepoint) mapping
            for j, v in enumerate(row):
                if v is None:
                    continue
                s = str(v).strip()
                t_raw = s.split('-')[0].split('_')[0] if '-' in s or '_' in s else ''
                tp_raw = s
                tissue = norm_tissue(s)
                tp = norm_time(s)
                if tissue in TISSUES and tp in TIMEPOINTS:
                    combo_cols[(tissue, tp)] = j
            break

    if not combo_cols:
        # No explicit labels — assume COMBO_LABELS order in cols 1–6
        for j, (tissue, tp) in enumerate(COMBO_LABELS):
            combo_cols[(tissue, tp)] = j + 1

    print(f'    combo_cols={combo_cols}')

    # Parse type rows (skip header row)
    for row in rows:
        if not row or row[0] is None:
            continue
        type_label = str(row[0]).strip()
        matched_type = None
        for t in SNCNA_TYPES:
            if t.lower() in type_label.lower():
                matched_type = t
                break
        if not matched_type:
            continue
        for (tissue, tp), j in combo_cols.items():
            if j < len(row):
                cnt = safe_int(row[j])
                counts.append({
                    'tissue': tissue,
                    'timepoint': tp,
                    'type': matched_type,
                    'count': cnt,
                })

    write_json('categories_counts.json', counts)

    # ── Sheet 2: 长度分布 (31×32) ─────────────────────────────────────────
    ws_len = wb.worksheets[1]
    len_rows = ws_rows(ws_len)
    print(f'    长度分布: {len(len_rows)} rows × {len(len_rows[0]) if len_rows else 0} cols')

    # 4 blocks of 7 rows each (1 header + 6 sample rows)
    # Header row of each block: [type_name, len1, len2, ...]
    # Sample rows: [sample_code, val1, val2, ...]
    length_dist = {}

    block_size = 7
    # Find block start positions (rows with type names in col 0)
    block_starts = []
    for i, row in enumerate(len_rows):
        if row[0] is not None:
            s = str(row[0]).strip()
            if any(t.lower() in s.lower() for t in SNCNA_TYPES):
                block_starts.append(i)

    if not block_starts:
        # Fallback: assume 4 blocks starting at rows 0, 8, 16, 24
        block_starts = [0, 8, 16, 24]

    print(f'    block_starts={block_starts}')

    for bstart in block_starts:
        if bstart >= len(len_rows):
            continue
        header_row = len_rows[bstart]
        # Identify type name from col 0
        type_name = None
        for t in SNCNA_TYPES:
            if t.lower() in str(header_row[0] or '').lower():
                type_name = t
                break
        if not type_name:
            continue

        # Extract lengths from col 1 onwards
        lengths = []
        for v in header_row[1:]:
            try:
                lengths.append(int(float(v)))
            except (TypeError, ValueError):
                if v is not None:
                    break  # Stop at first non-numeric

        # Parse sample rows
        series = []
        for i in range(1, block_size):
            row_idx = bstart + i
            if row_idx >= len(len_rows):
                break
            srow = len_rows[row_idx]
            if not any(v for v in srow if v is not None):
                continue
            sample_label = norm_sample(str(srow[0] or '').strip())
            values = [safe_float(srow[j + 1]) for j in range(len(lengths))]
            series.append({'sample': sample_label, 'values': values})

        length_dist[type_name] = {'lengths': lengths, 'series': series}

    write_json('length_distribution.json', length_dist)


# ─────────────────────────────────────────────────────────────────────────────
# 3. top50_pie.json + top50.json  ←  Top50sncRNA.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def parse_top50():
    wb = openpyxl.load_workbook(os.path.join(DATA_DIR, 'Top50sncRNA.xlsx'), data_only=True)
    sheet_names = [ws.title for ws in wb.worksheets]
    print(f'    Top50sncRNA.xlsx sheets: {sheet_names}')

    # ── Sheet 饼状图 (pie chart) ──────────────────────────────────────────
    ws_pie = wb.worksheets[0]
    pie_rows = ws_rows(ws_pie)
    print(f'    饼状图: {len(pie_rows)} rows × {len(pie_rows[0]) if pie_rows else 0} cols')

    # Similar structure to categories bar chart:
    # [type_label, combo1_tpm, combo2_tpm, ..., combo6_tpm]
    pie_data = {t: [] for t in SNCNA_TYPES}

    # Find header row with combo labels
    pie_combo_cols = {}
    for i, row in enumerate(pie_rows[:4]):
        for j, v in enumerate(row):
            if v is None:
                continue
            s = str(v).strip()
            tissue = norm_tissue(s)
            tp = norm_time(s)
            if tissue in TISSUES and tp in TIMEPOINTS:
                pie_combo_cols[(tissue, tp)] = j

    if not pie_combo_cols:
        for j, (tissue, tp) in enumerate(COMBO_LABELS):
            pie_combo_cols[(tissue, tp)] = j + 1

    for row in pie_rows:
        if not row or row[0] is None:
            continue
        type_label = str(row[0]).strip()
        matched_type = None
        for t in SNCNA_TYPES:
            if t.lower() in type_label.lower():
                matched_type = t
                break
        if not matched_type:
            continue
        for (tissue, tp), j in pie_combo_cols.items():
            if j < len(row):
                pie_data[matched_type].append({
                    'name': f'{tissue} {tp}',
                    'value': round(safe_float(row[j]), 4),
                })

    write_json('top50_pie.json', pie_data)

    # ── Per-type sheets: miRNA, piRNA, tsRNA, rsRNA ───────────────────────
    top50_entries = []

    # Identify sheets by matching type names
    type_sheets = {}
    for ws in wb.worksheets[1:]:  # skip 饼状图
        name = ws.title.strip()
        for t in SNCNA_TYPES:
            if t.lower() in name.lower():
                type_sheets[t] = ws
                break

    print(f'    type_sheets found: {list(type_sheets.keys())}')

    # Column mapping (from plan): ID, Type, Tissue, Stage, Expression(TPM), %TPM, Seed Sequence
    COL_CANDIDATES = {
        'id':         ('id', 'seq_id', 'name', 'sncrna'),
        'type':       ('type', 'class'),
        'tissue':     ('tissue',),
        'stage':      ('stage', 'timepoint', 'week'),
        'tpm':        ('expression', 'tpm'),
        'percentTPM': ('% tpm', '%tpm', 'percent'),
        'seedSequence': ('seed', 'sequence'),
    }

    def map_cols(header):
        mapping = {}
        for field, candidates in COL_CANDIDATES.items():
            for j, h in enumerate(header):
                s = str(h or '').lower()
                if any(c in s for c in candidates) and field not in mapping:
                    mapping[field] = j
        return mapping

    for t, ws in type_sheets.items():
        rows_all = ws_rows(ws)
        if not rows_all:
            continue

        # Find header row
        col_map = {}
        data_start = 0
        for i, row in enumerate(rows_all[:5]):
            cm = map_cols(row)
            if len(cm) >= 3:
                col_map = cm
                data_start = i + 1
                break

        if not col_map:
            # Fallback: assume fixed order
            col_map = {'id': 0, 'type': 1, 'tissue': 2, 'stage': 3,
                       'tpm': 4, 'percentTPM': 5, 'seedSequence': 6}

        print(f'    {t} col_map={col_map}  data rows={len(rows_all)-data_start}')

        # Group by (tissue, timepoint) to assign rank
        groups: dict[tuple, list] = {}
        for row in rows_all[data_start:]:
            if not any(v for v in row if v is not None):
                continue
            tissue = norm_tissue(str(row[col_map.get('tissue', 2)] or ''))
            tp = norm_time(str(row[col_map.get('stage', 3)] or ''))
            key = (tissue, tp)
            groups.setdefault(key, []).append(row)

        for (tissue, tp), group_rows in groups.items():
            # Sort by TPM descending to assign rank
            def get_tpm(r):
                return safe_float(r[col_map.get('tpm', 4)])
            group_rows.sort(key=get_tpm, reverse=True)
            for rank_0, row in enumerate(group_rows[:50]):
                entry = {
                    'rank': rank_0 + 1,
                    'id': str(row[col_map.get('id', 0)] or '').strip(),
                    'type': t,
                    'tissue': tissue,
                    'timepoint': tp,
                    'tpm': round(safe_float(row[col_map.get('tpm', 4)]), 4),
                    'percentTPM': round(safe_float(row[col_map.get('percentTPM', 5)]), 4),
                    'seedSequence': str(row[col_map.get('seedSequence', 6)] or '').strip(),
                }
                top50_entries.append(entry)

    write_json('top50.json', top50_entries)


# ─────────────────────────────────────────────────────────────────────────────
# 4. diff_expression_{type}_volcano.json + _significant.json
#    ←  差异表达_<type>.xlsx  × 4
# ─────────────────────────────────────────────────────────────────────────────
def parse_diff_expression():
    DE_FILES = {
        'miRNA': '差异表达_miRNA.xlsx',
        'piRNA': '差异表达_piRNA.xlsx',
        'tsRNA': '差异表达_tsRNA.xlsx',
        'rsRNA': '差异表达_rsRNA.xlsx',
    }

    COL_MAP_CANDIDATES = {
        'id':         ('seq_id', 'id', 'name', 'sncrna'),
        'log2FC':     ('log2fc', 'log2_fc', 'log2fold', 'log2 fc'),
        'pvalue':     ('pvalue', 'p_value', 'p value', 'pval'),
        'padj':       ('padjust', 'padj', 'fdr', 'adj'),
        'regulate':   ('regulate', 'regulation', 'sig'),
        'tissue':     ('tissue',),
    }

    def find_col_map(header):
        result = {}
        for field, cands in COL_MAP_CANDIDATES.items():
            for j, h in enumerate(header):
                s = str(h or '').lower().replace(' ', '').replace('_', '').replace('.', '')
                for c in cands:
                    cc = c.replace(' ', '').replace('_', '')
                    if cc in s and field not in result:
                        result[field] = j
                        break
        return result

    for sncna_type, filename in DE_FILES.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f'    SKIP {filename} (not found)')
            continue

        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet_names = [ws.title for ws in wb.worksheets]
        print(f'    {filename}: sheets={sheet_names}')

        volcano_records = []
        significant_records = []

        for ws in wb.worksheets:
            rows_all = ws_rows(ws)
            if not rows_all:
                continue

            # Find header row
            col_map = {}
            data_start = 0
            for i, row in enumerate(rows_all[:5]):
                cm = find_col_map(row)
                if len(cm) >= 3:
                    col_map = cm
                    data_start = i + 1
                    break

            if not col_map:
                # Fallback fixed order: seq_id, fold_change, log2fc, pvalue, padjust, significant, regulate, Tissue
                col_map = {'id': 0, 'log2FC': 2, 'pvalue': 3, 'padj': 4, 'regulate': 6, 'tissue': 7}

            print(f'      sheet={ws.title!r}  col_map={col_map}  data_rows={len(rows_all)-data_start}')

            # Infer tissue from sheet name if no tissue column
            sheet_tissue = norm_tissue(ws.title)

            for row in rows_all[data_start:]:
                if not any(v for v in row if v is not None):
                    continue
                rid = str(row[col_map.get('id', 0)] or '').strip()
                if not rid:
                    continue

                log2fc = safe_float(row[col_map.get('log2FC', 2)])
                pvalue = safe_float(row[col_map.get('pvalue', 3)], 1.0)
                padj = safe_float(row[col_map.get('padj', 4)], 1.0)

                # Regulation from thresholds (|log2FC|>=0.585 AND raw p-value<=0.05)
                if abs(log2fc) >= 0.585 and pvalue <= 0.05:
                    reg_raw = str(row[col_map.get('regulate', 6)] or '').strip().lower()
                    if 'up' in reg_raw:
                        regulation = 'Up'
                    elif 'down' in reg_raw:
                        regulation = 'Down'
                    else:
                        regulation = 'Up' if log2fc > 0 else 'Down'
                else:
                    regulation = 'NS'

                # Tissue: prefer column, fall back to sheet name
                if 'tissue' in col_map and col_map['tissue'] < len(row):
                    tissue = norm_tissue(str(row[col_map['tissue']] or ''))
                else:
                    tissue = sheet_tissue if sheet_tissue in TISSUES else 'Hypothalamus'

                # Comparison string
                tp1 = 'HT' if tissue == 'Hypothalamus' else ('HP' if tissue == 'Pituitary' else 'OV')
                comparison = f'{tp1}-16_vs_{tp1}-35'

                volcano_records.append({
                    'id': rid,
                    'type': sncna_type,
                    'tissue': tissue,
                    'log2FC': round(log2fc, 6),
                    'pvalue': round(pvalue, 8) if pvalue > 0 else pvalue,
                    'padj': round(padj, 8) if padj > 0 else padj,
                    'regulation': regulation,
                })

                if regulation in ('Up', 'Down'):
                    significant_records.append({
                        'id': rid,
                        'type': sncna_type,
                        'tissue': tissue,
                        'comparison': comparison,
                        'log2FC': round(log2fc, 6),
                        'pvalue': round(pvalue, 8) if pvalue > 0 else pvalue,
                        'padj': round(padj, 8) if padj > 0 else padj,
                        'regulation': regulation,
                    })

        # Subsample NS records to keep volcano file size manageable
        sig_records = [r for r in volcano_records if r['regulation'] != 'NS']
        ns_records  = [r for r in volcano_records if r['regulation'] == 'NS']
        if len(ns_records) > NS_CAP_PER_FILE:
            random.seed(42)
            ns_records = random.sample(ns_records, NS_CAP_PER_FILE)
        volcano_out = sig_records + ns_records
        random.shuffle(volcano_out)
        write_json(f'diff_expression_{sncna_type}_volcano.json', volcano_out)
        write_json(f'diff_expression_{sncna_type}_significant.json', significant_records)


# ─────────────────────────────────────────────────────────────────────────────
# 5. targets.json  ←  靶基因预测.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def parse_targets():
    wb = openpyxl.load_workbook(os.path.join(DATA_DIR, '靶基因预测.xlsx'), data_only=True)
    sheet_names = [ws.title for ws in wb.worksheets]
    print(f'    靶基因预测.xlsx sheets: {sheet_names}')

    COL_CANDIDATES = {
        'id':               ('id', 'sncrna id', 'seq_id', 'name'),
        'type':             ('type', 'class'),
        'bindingSite':      ('binding site', 'binding', 'site'),
        'targetGene':       ('target gene', 'gene', 'target_gene'),
        'geneDescription':  ('gene description', 'description', 'function'),
        'mfe':              ('mfe', 'energy', 'kcal'),
        'targetExpression': ('target expression', 'expression', 'regulation'),
        'tissue':           ('tissue',),
    }

    def find_col_map(header):
        result = {}
        for field, cands in COL_CANDIDATES.items():
            for j, h in enumerate(header):
                s = str(h or '').lower()
                for c in cands:
                    if c in s and field not in result:
                        result[field] = j
                        break
        return result

    def norm_binding(raw) -> tuple:
        """Return (normalized, label)."""
        s = str(raw or '').strip()
        lo = s.lower()
        if 'promoter' in lo:
            return 'promoter', 'Promoter'
        if 'body' in lo or 'rna body' in lo or 'gene body' in lo:
            return 'body', s  # preserve original label
        return 'promoter', s

    def norm_target_expr(raw) -> str:
        s = str(raw or '').strip().lower()
        if 'up' in s: return 'Upregulated'
        if 'down' in s: return 'Downregulated'
        return 'Upregulated'

    all_targets = []
    global_idx = 0

    for ws in wb.worksheets:
        rows_all = ws_rows(ws)
        if not rows_all:
            continue

        col_map = {}
        data_start = 0
        for i, row in enumerate(rows_all[:5]):
            cm = find_col_map(row)
            if len(cm) >= 3:
                col_map = cm
                data_start = i + 1
                break

        if not col_map:
            # Fallback: ID, Type, Binding Site, Target Gene, Gene Description, MFE, Target Expression, Tissue
            col_map = {'id': 0, 'type': 1, 'bindingSite': 2, 'targetGene': 3,
                       'geneDescription': 4, 'mfe': 5, 'targetExpression': 6, 'tissue': 7}

        print(f'      sheet={ws.title!r}  col_map={col_map}  data_rows={len(rows_all)-data_start}')

        for row in rows_all[data_start:]:
            if not any(v for v in row if v is not None):
                continue
            rid = str(row[col_map.get('id', 0)] or '').strip()
            if not rid:
                continue

            sncna_type_raw = str(row[col_map.get('type', 1)] or '').strip()
            matched_type = 'miRNA'
            for t in SNCNA_TYPES:
                if t.lower() in sncna_type_raw.lower():
                    matched_type = t
                    break

            binding_raw = str(row[col_map.get('bindingSite', 2)] or '').strip()
            binding_norm, binding_label = norm_binding(binding_raw)

            target_gene = str(row[col_map.get('targetGene', 3)] or '').strip()
            gene_desc = str(row[col_map.get('geneDescription', 4)] or '').strip()
            mfe = round(safe_float(row[col_map.get('mfe', 5)]), 2)
            target_expr = norm_target_expr(row[col_map.get('targetExpression', 6)])
            tissue = norm_tissue(str(row[col_map.get('tissue', 7)] or ''))
            if tissue not in TISSUES:
                tissue = norm_tissue(ws.title)
            if tissue not in TISSUES:
                tissue = 'Hypothalamus'

            # Stable id
            binding_slug = re.sub(r'[^a-z0-9]', '', binding_norm.lower())
            entry_id = f'tgt-{matched_type}-{binding_slug}-{global_idx}'
            global_idx += 1

            all_targets.append({
                'id': entry_id,
                'sncRNAId': rid,
                'sncRNAType': matched_type,
                'bindingSite': binding_norm,
                'bindingSiteLabel': binding_label,
                'targetGene': target_gene,
                'geneDescription': gene_desc,
                'mfe': mfe,
                'targetExpression': target_expr,
                'tissue': tissue,
            })

    write_json('targets.json', all_targets)


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import sys

    print('SRGBASE: Excel -> JSON conversion')
    print(f'  Source: {DATA_DIR}')
    print(f'  Output: {OUT_DIR}')
    print()

    steps = [
        ('封面概况.xlsx → overview.json',              parse_overview),
        ('sncRNA_categories.xlsx → counts + length',   parse_categories),
        ('Top50sncRNA.xlsx → top50_pie + top50',       parse_top50),
        ('差异表达_*.xlsx → volcano + significant',    parse_diff_expression),
        ('靶基因预测.xlsx → targets.json',             parse_targets),
    ]

    failed = []
    for label, fn in steps:
        print(f'── {label}')
        try:
            fn()
        except Exception as e:
            import traceback
            print(f'  ✗ ERROR: {e}')
            traceback.print_exc()
            failed.append(label)
        print()

    if failed:
        print(f'FAILED steps: {failed}')
        sys.exit(1)
    else:
        print('All done.')
        sys.exit(0)
