    // Merchant: first non‑trivial line that is not a date line.
    for (let i = 0; i < lines.length; i++) {
      if (i === dateIdx) continue;
      const line = lines[i];
-      if (line.length > 2 && !/receipt|session|order|thank/i.test(line) && !parseDateString(line)) {
+      if (line.length > 2 && !/receipt|session|order|thank/i.test(line) && !parseDateString(line)) {
         result.merchant = line;
         break;
       }
     }
*** End Patch