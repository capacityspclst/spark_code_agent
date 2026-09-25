import unittest
import random
from roman import to_roman, from_roman

class TestRoman(unittest.TestCase):
    def test_to_roman_known(self):
        known = [
            (1, 'I'),
            (4, 'IV'),
            (9, 'IX'),
            (40, 'XL'),
            (90, 'XC'),
            (400, 'CD'),
            (900, 'CM'),
            (58, 'LVIII'),
            (1994, 'MCMXCIV'),
            (3999, 'MMMCMXCIX'),
        ]
        for n, expected in known:
            self.assertEqual(to_roman(n), expected, f'to_roman({n})')

    def test_to_roman_out_of_range(self):
        for n in (0, -1, 4000, 5000):
            with self.assertRaises(ValueError):
                to_roman(n)

    def test_from_roman_known(self):
        known = {
            'I': 1,
            'IV': 4,
            'IX': 9,
            'XL': 40,
            'XC': 90,
            'CD': 400,
            'CM': 900,
            'LVIII': 58,
            'MCMXCIV': 1994,
            'MMMCMXCIX': 3999,
        }
        for s, expected in known.items():
            self.assertEqual(from_roman(s), expected, f'from_roman({s})')

    def test_from_roman_invalid(self):
        invalid = [
            '',
            'IIII',    # repeated I
            'VV',      # repeated V
            'VX',      # invalid subtractive
            'IC',      # invalid subtractive
            'IL',      # invalid subtractive
            'IM',      # invalid subtractive
            'XM',      # invalid subtractive
            'MCMC',    # invalid pattern
            'IIV',     # invalid subtractive sequence
            'XIIII',   # too many I's after X
            'ii',      # lowercase not allowed
            'ABC',     # non‑Roman characters
        ]
        for s in invalid:
            with self.assertRaises(ValueError):
                from_roman(s)

    def test_roundtrip_random(self):
        random.seed(0)
        for _ in range(200):
            n = random.randint(1, 3999)
            roman = to_roman(n)
            self.assertEqual(from_roman(roman), n)
            # ensure canonical representation by round‑tripping back to Roman
            self.assertEqual(to_roman(n), roman)

if __name__ == '__main__':
    unittest.main()
