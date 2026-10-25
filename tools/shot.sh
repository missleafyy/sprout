#!/bin/bash
# tools/shot.sh <page-with-query> <out.png> [WxH] [ms]
# Screenshot a page headlessly and print console errors/warnings.
cd "$(dirname "$0")/.."
page="$1"; out="$2"; size="${3:-1200,900}"; ms="${4:-1500}"
timeout 60 brave-browser --headless=new --disable-gpu --no-sandbox --hide-scrollbars --mute-audio \
  --enable-logging=stderr --v=0 --allow-file-access-from-files \
  --screenshot="$(realpath -m "$out")" --window-size="$size" --virtual-time-budget="$ms" \
  "file://$PWD/$page" 2>&1 | grep -E "CONSOLE" | sed -E 's/.*CONSOLE:[0-9]+\] //' | grep -v "browser is shutting down" | head -30
