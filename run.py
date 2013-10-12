from flask import Flask
from vdfjson import vdfjson

app = Flask(__name__)
app.register_blueprint(vdfjson, url_prefix="/")

if __name__ == "__main__":
    app.run()
