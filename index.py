import json
import os
# import uwsgi
from steam import vdf
import web
#web.config.debug = False

path = os.path.dirname(os.path.abspath(__file__))

urls = ("/img/(.*)", 'images',
        "/css/(.*)", 'css',
        "/js/(.*)", 'js',
        "", 'poot_index',
        "/", 'index')

render = web.template.render(os.path.join(path, 'templates'), base='layout')


class poot_index:
    def GET(self):
        raise web.seeother("/")


class index:
    def GET(self):
        return render.index()

    def POST(self):
        _input = web.input()
        format = _input.get("format")
        error = False

        try:
            if format == "vdf":
                data = json.dumps(
                    vdf.loads(_input.get("data")),
                    indent=4
                )

            elif format == "json":
                _data = json.loads(_input.get("data"))
                data = vdf.dumps(_data).decode("utf-16")

        except ValueError:
            data = "{}" if format == json else ""
            error = True

        return render.formatted(data, format, error)


class images:
    def GET(self, name):
        ext = name.split(".")[-1]

        cType = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "gif": "image/gif",
            "ico": "image/x-icon"
        }

        if name in os.listdir(os.path.join(path, 'images')):
            web.header("Content-Type", cType[ext])
            return open(os.path.join(path, 'images', '{}'.format(name)), "rb").read()
        else:
            raise web.notfound()


class css:
    def GET(self, name):
        if name in os.listdir(os.path.join(path, 'css')):
            web.header("Content-Type", "text/css")
            return open(os.path.join(path, 'css', '{}'.format(name)), "r").read()
        else:
            raise web.notfound()


class js:
    def GET(self, name):
        if name in os.listdir(os.path.join(path, 'js')):
            web.header("Content-Type", "application/js")
            return open(os.path.join(path, 'js', '{}'.format(name)), "r").read()
        else:
            raise web.notfound()


app = web.application(urls, globals())
if __name__ == "__main__":
    app.run()

application = app.wsgifunc()
