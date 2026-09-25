#!/usr/bin/env python3
import unittest
import random
import roman

class TestRoman(unittest.TestCase):
    def test_known_conversions(self):
        known = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV',
            5: 'V',
            9: 'IX',
            10: 'X',
            14: 'XIV',
            19: 'XIX',
            40: 'XL',
            44: 'XLIV',
            49: 'XLIX',
            50: 'L',
            90: 'XC',
            99: 'XCIX',
            100: 'C',
            400: 'CD',
            444: 'CDXLIV',
            500: 'D',
            900: 'CM',
            999: 'CMXCIX',
            1000: 'M',
            1984: 'MCMLXXXIV',
            1999: 'MCMXCIX',
            3999: 'MMMCMXCIX',
        }
        for num, roman_str in known.items():
            self.assertEqual(roman.to_roman(num), roman_str, f"to_roman({num})")
            self.assertEqual(roman.from_roman(roman_str), num, f"from_roman({roman_str})")

    def test_roundtrip_random(self):
        random.seed(0)
        for _ in range(200):
            n = random.randint(1, 3999)
            s = roman.to_roman(n)
            self.assertEqual(roman.from_roman(s), n)

    def test_to_roman_invalid(self):
        for n in (0, -5, 4000, 5000):
            with self.assertRaises(ValueError):
                roman.to_roman(n)

    def test_from_roman_invalid(self):
        invalid = [
            '',
            'IIII',   # too many repeats
            'VV',      # V cannot repeat
            'XXXX',    # too many repeats
            'LL',
            'CCCC',
            'DD',
            'MMMM',    # exceeds 3999
            'VX',      # invalid subtractive pair
            'LC',
            'DM',
            'IC',
            'XM',
            'IIV',
            'IXI',
            'XCD',
            'MIM',
            'Cm',      # mixed case
            'iv',      # lower case
            'ABC',
            '123',
            'X V',     # contains space
        ]
        for s in invalid:
            with self.subTest(s=s):
                with self.assertRaises(ValueError):
                    roman.from_roman(s)

if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestRoman)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if result.wasSuccessful():
        print('All tests passed.')
        exit(0)
    else:
        exit(1)
