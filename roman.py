# roman.py
"""Conversion between integers and Roman numerals.

Provides two public functions:

* :func:`to_roman` converts an integer in the range 1‑3999 to its canonical
  Roman numeral representation.
* :func:`from_roman` converts a Roman numeral string to the corresponding
  integer, validating that the string is well‑formed and uses the canonical
  subtractive notation.

Both functions raise :class:`ValueError` for out‑of‑range numbers or invalid
Roman strings.
"""

from __future__ import annotations

__all__ = ["to_roman", "from_roman"]

# Mapping of Roman numeral symbols to their integer values, ordered from
# highest to lowest to simplify greedy conversion.
_ROMAN_PAIRS: list[tuple[str, int]] = [
    ("M", 1000),
    ("CM", 900),
    ("D", 500),
    ("CD", 400),
    ("C", 100),
    ("XC", 90),
    ("L", 50),
    ("XL", 40),
    ("X", 10),
    ("IX", 9),
    ("V", 5),
    ("IV", 4),
    ("I", 1),
]

# Set of all valid single‑character Roman symbols – used for quickly checking
# that the input string contains only allowed characters.
_VALID_CHARS = set("MDCLXVI")

# Helper dictionary for parsing a symbol (including subtractive pairs) to its value.
_SINGLE_MAP: dict[str, int] = {sym: val for sym, val in _ROMAN_PAIRS}


def to_roman(n: int) -> str:
    """Return the canonical Roman numeral for *n*.

    Parameters
    ----------
    n:
        An integer between 1 and 3999 inclusive.

    Raises
    ------
    ValueError
        If *n* is outside the supported range or is not a plain ``int`` (bools
        are rejected).
    """
    # ``bool`` is a subclass of ``int``; explicitly reject it.
    if not isinstance(n, int) or isinstance(n, bool):
        raise ValueError("Input must be an integer.")
    if not (1 <= n <= 3999):
        raise ValueError("Roman numerals support numbers from 1 to 3999 inclusive.")

    result_parts: list[str] = []
    remaining = n
    for symbol, value in _ROMAN_PAIRS:
        if remaining == 0:
            break
        count, remaining = divmod(remaining, value)
        result_parts.append(symbol * count)
    return "".join(result_parts)


def _validate_roman_string(s: str) -> None:
    """Validate that *s* is a non‑empty canonical Roman numeral.

    This function checks for:
    * non‑empty string
    * only characters present in the Roman alphabet (uppercase)
    * canonical form using a round‑trip check.
    """
    if not isinstance(s, str) or not s:
        raise ValueError("Roman numeral must be a non‑empty string.")
    if any(ch not in _VALID_CHARS for ch in s):
        raise ValueError("Roman numeral contains invalid characters.")
    # Ensure the string is in canonical form by converting back and forth.
    # We'll compute the integer value and then re‑encode it; if the result
    # differs, the original string was not canonical (e.g., "IIII").
    value = _parse_roman_without_canonical_check(s)
    if to_roman(value) != s:
        raise ValueError("Roman numeral is not in canonical form.")


def _parse_roman_without_canonical_check(s: str) -> int:
    """Parse *s* to an integer using subtractive rules without canonical check.

    The caller is responsible for any additional validation.
    """
    i = 0
    total = 0
    length = len(s)
    while i < length:
        # Look ahead for a possible subtractive pair.
        if i + 1 < length and s[i : i + 2] in _SINGLE_MAP:
            total += _SINGLE_MAP[s[i : i + 2]]
            i += 2
        else:
            total += _SINGLE_MAP[s[i]]
            i += 1
    return total


def from_roman(s: str) -> int:
    """Convert a canonical Roman numeral *s* to its integer value.

    Parameters
    ----------
    s:
        A string representing a Roman numeral in canonical form.

    Returns
    -------
    int
        The integer value of the numeral.

    Raises
    ------
    ValueError
        If *s* is empty, contains invalid characters, or is not in canonical
        form.
    """
    # Perform full validation, including canonical check.
    _validate_roman_string(s)
    # At this point the string is known to be canonical, so we can safely parse.
    return _parse_roman_without_canonical_check(s)

# End of module
