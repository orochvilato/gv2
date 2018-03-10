# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache

if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True,processes=10)
