[from Claude Code, on John's behalf - the two security findings that stopped the last run]
1. high-csv-injection (src/lib/exportCsv.ts): a receipt note or category starting with = + - @ (or a tab/carriage return) becomes a formula when the CSV is opened in Excel/Sheets. Neutralise every text cell: if it starts with one of = + - @ \t \r, prefix it with a single quote ('), then quote the cell ("..." with inner quotes doubled). Numbers you generate yourself (amounts, miles) stay plain numbers.
2. high-pdf-html-injection (src/lib/exportPdf.ts): user text is put into the HTML that becomes the PDF. Escape every user-supplied value (notes, categories, purposes, file names) with an escapeHtml() that replaces & < > " ' with &amp; &lt; &gt; &quot; &#39; before inserting it, and never insert user text into attributes, styles or scripts.
Add a unit test for each (a note "=HYPERLINK(...)" exports as '=HYPERLINK(...); a note "<img src=x onerror=alert(1)>" appears escaped in the HTML).

