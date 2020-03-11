from flask import Flask, render_template, request, jsonify, send_from_directory, current_app
import os

app = Flask(__name__, static_folder='web/static',
            template_folder='web/templates')

# render index at route /
@app.route('/')
def index():
    return render_template("index.html")


# version 2 (with sidenav) at route /v2
@app.route('/v2')
def v2():
    return render_template("v2.html")

# version 1 (w/o side bar) at route /v1
@app.route('/v1')
def v1():
    return render_template("v1.html")

# send static files from directory (img for v1)
@app.route('/img/version1/<path:filename>')
def send_imgv1(filename):
    return send_from_directory('web/static/img/version1', filename)

# send static files from directory (img for v2)
@app.route('/img/version2/<path:filename>')
def send_imgv2(filename):
    return send_from_directory('web/static/img/version2', filename)

# send static files from directory (js)
@app.route('/js/<path:filename>')
def send_js(filename):
    return send_from_directory('web/static/js', filename)

# send static files from directory (css)
@app.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('web/static/css', filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8091, debug=True)
