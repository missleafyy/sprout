#!/bin/bash
# Launch a game in its own app window.
#   ./play.sh                 Sprout Town
#   ./play.sh cracky          Cracky: Still in Transit
#   ./play.sh '?map=town'     Sprout Town with dev options (same for: ./play.sh cracky '?map=lot')
cd "$(dirname "$0")"
PAGE=index.html
if [ "$1" = "cracky" ]; then PAGE=cracky.html; shift; fi
URL="file://$PWD/$PAGE$1"
for b in brave-browser chromium google-chrome firefox; do
  if command -v $b >/dev/null; then
    case $b in firefox) exec firefox "$URL" ;; *) exec $b --app="$URL" --window-size=760,960 ;; esac
  fi
done
xdg-open "$URL"
