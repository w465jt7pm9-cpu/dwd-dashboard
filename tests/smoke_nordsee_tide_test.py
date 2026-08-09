import re
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
APP_JS = REPO_ROOT / 'js' / 'app.js'


def test_nordsee_tide_markup_contains_required_parts():
    source = APP_JS.read_text(encoding='utf-8')

    required_markers = [
        'buildNordseeTideIndicatorHeaderRowMarkup',
        'ostsee-ts-tide-row',
        'ostsee-ts-tide-cell',
        'ostsee-ts-tide-segment',
        'data-label-full',
        'data-label-compact',
    ]

    missing = [marker for marker in required_markers if marker not in source]
    assert not missing, f'Missing required AdG tide markers: {missing}'


if __name__ == '__main__':
    test_nordsee_tide_markup_contains_required_parts()
    print('Smoke test passed for Nordsee tide markup')
