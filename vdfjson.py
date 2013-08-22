from flask import Flask, flash, request, render_template
from steam import vdf
import json

app = Flask(__name__)


@app.route('/', methods=["GET", "POST"])
def index():
    response = None
    format = "json"
    if request.method == "POST":
        format = request.form["format"]
        data = request.form["data"]

        try:
            if format == "vdf":
                response = json.dumps(
                    vdf.loads(data),
                    indent=4
                )

            elif format == "json":
                _response = json.loads(data)
                response = vdf.dumps(_response).decode("utf-16")

        except ValueError:
            flash("ValueError:  Your {} may not be valid.".format(format), "danger")
            response = "{}" if format == "json" else ""

    return render_template("index.html", response=response, format=format, title="vdfjson")


if __name__ == '__main__':
    app.run()
