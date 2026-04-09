import re

with open('/extras/report.html', 'r') as f:
    content = f.read()

# Pattern: </div>\n\n<!-- === -->\n<!-- PAGE X: ... -->\n<!-- === -->\n<div class="page">
pattern = r'</div>\n\n<!-- =+ -->\n<!-- .+? -->\n<!-- =+ -->\n<div class="page">'

# Split content: front page part vs rest
# The front page ends at </div>\n</div> right before <!-- PAGE 2
split_marker = '<!-- ==============================================================  -->\n<!-- PAGE 2: TABLE OF CONTENTS -->'
idx = content.find(split_marker)

if idx == -1:
    # Try without extra space
    split_marker = '<!-- ============================================================== -->\n<!-- PAGE 2: TABLE OF CONTENTS -->'
    idx = content.find(split_marker)

front_part = content[:idx]
rest = content[idx:]

# Remove all </div> + comment + <div class="page"> boundaries in content area
rest_cleaned = re.sub(pattern, '', rest)

result = front_part + rest_cleaned

with open('/extras/report.html', 'w') as f:
    f.write(result)

count = len(re.findall(pattern, rest))
print(f'Done! Removed {count} page div boundaries.')
