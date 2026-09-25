# roman.py
"""Utility functions for converting between integers and Roman numerals.

The module provides two public functions:

* ``to_roman(n)`` – Return the canonical Roman numeral representation of ``n``.
* ``from_roman(s)`` – Parse a Roman numeral string ``s`` and return its integer value.

Both functions raise ``ValueError`` for out‑of‑range or malformed inputs.

The implementation follows the classic subtractive notation and validates
strictly by round‑tripping the parsed value back to a Roman numeral.
"""

from __future__ import annotations

# Mapping of integer values to Roman numerals in descending order.
_ROMAN_MAP = [
    (1000, "M"),
    (900, "CM"),
    (500, "D"),
    (400, "CD"),
    (100, "C"),
    (90, "XC"),
    (50, "L"),
    (40, "XL"),
    (10, "X"),
    (9, "IX"),
    (5, "V"),
    (4, "IV"),
    (1, "I"),
]

# Simple lookup for single symbols – used by the parser.
_SINGLE_SYMBOLS = {
    "I": 1,
    "V": 5,
    "X": 10,
    "L": 50,
    "C": 100,
    "D": 500,
    "M": 1000,
}


def to_roman(n: int) -> str:
    """Convert an integer to its canonical Roman numeral representation.

    Parameters
    ----------
    n: int
        Integer to convert. Must satisfy ``1 <= n <= 3999``.

    Returns
    -------
    str
        The Roman numeral string.

    Raises
    ------
    ValueError
        If ``n`` is not an integer in the allowed range.
    """
    if not isinstance(n, int) or n < 1 or n > 3999:
        raise ValueError("Integer out of range (must be 1..3999)")

    result = []
    remainder = n
    for value, numeral in _ROMAN_MAP:
        count, remainder = divmod(remainder, value)
        if count:
            result.append(numeral * count)
        if remainder == 0:
            break
    return "".join(result)


def _parse_roman(s: str) -> int:
    """Parse a Roman numeral string to an integer without validation.

    This function implements the additive/subtractive algorithm and raises
    ``ValueError`` for unknown symbols.
    """
    total = 0
    i = 0
    length = len(s)
    while i < length:
        ch = s[i]
        if ch not in _SINGLE_SYMBOLS:
            raise ValueError(f"Invalid Roman numeral character: {ch!r}")
        value = _SINGLE_SYMBOLS[ch]
        # Look ahead to decide whether to add or subtract
        if i + 1 < length:
            next_ch = s[i + 1]
            if next_ch not in _SINGLE_SYMBOLS:
                raise ValueError(f"Invalid Roman numeral character: {next_ch!r}")
            next_value = _SINGLE_SYMBOLS[next_ch]
            if value < next_value:
                total -= value
                i += 1
                continue
        total += value
        i += 1
    return total


def from_roman(s: str) -> int:
    """Convert a Roman numeral string to its integer value.

    The function validates that ``s`` is a non‑empty, canonical Roman numeral
    within the range 1‑3999. Validation is performed by parsing the string and
    then re‑encoding the resulting integer with :func:`to_roman`; any mismatch
    indicates a non‑canonical or otherwise invalid input.

    Parameters
    ----------
    s: str
        Roman numeral to convert.

    Returns
    -------
    int
        The integer value of ``s``.

    Raises
    ------
    ValueError
        If ``s`` is empty, contains illegal characters, or does not represent a
        canonical numeral.
    """
    if not isinstance(s, str) or not s:
        raise ValueError("Input must be a non‑empty string")
    # Parse using the simple algorithm; any unknown character will raise.
    value = _parse_roman(s)
    # Ensure the value is within representable range.
    if value < 1 or value > 3999:
        raise ValueError("Roman numeral out of range (must represent 1..3999)")
    # Re‑encode and compare to guarantee canonical form.
    canonical = to_roman(value)
    if canonical != s:
        raise ValueError("Non‑canonical or invalid Roman numeral")
    return value


# Exported names for ``from roman import ...``
__all__ = ["to_roman", "from_roman"]
