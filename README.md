# SkateMetric Benchmark Visualization
This repo contains electric skateboard benchmark data and code to visualize it, which was previously found on <https://skatemetric.com>.
## Viewing Locally
In project directory:
```sh
# to start webserver
python -m http.server
# to open virtual drag race viewer in browser
open http://localhost:8000/drag_race.html
# to open chart viewer in browser
open http://localhost:8000/graphs.html
```
## Viewing Non-Production Boards
Data for DIYs, prototypes, and more specific tests weren't shown on the origial site.
In both `drag_race.html` and `graphs.html`, change the `SHOW_ALL_BOARDS` variable to `true` to view these.