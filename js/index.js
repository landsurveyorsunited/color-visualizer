"use strict";

var body = document.getElementsByTagName("BODY")[0];

new Vue({
  el: "#app",
  name: "color-vis",
  data: {
    // color list
    rawList: "#1ABC9C\n#16A085\n#2ECC71\n#27AE60\n#3498DB\n#2980B9\n#9B59B6\n#8E44AD\n#34495E\n#2C3E50\n#F1C40F\n#F39C12\n#E67E22\n#D35400\n#E74C3C\n#C0392B\n#ECF0F1\n#BDC3C7\n#95A5A6\n#7F8C8D",
    colorsNames: [],
    colorsList: [],
    removedColors: [],
    codeFormat: "rgb",
    size: 100,
    // misc
    bg: "white",
    txt: "black",
    temp: "#EEEEEE00",
    // show
    showNames: false,
    showCodes: false,
    showSaveBtn: false,
    // notifs
    notifs: [],
    notifDur: 3000
  },

  mounted: function mounted() {
    return this.colorsList = this.rawList.split("\n");
  },

  computed: {
    all: function all() {
      return {
        "background-color": this.tc(this.txt),
        color: this.tc(this.bg)
      };
    },
    text: function text() {
      return {
        color: this.tc(this.txt)
      };
    },
    border: function border() {
      return {
        "border-color": this.tc(this.txt)
      };
    },
    bubbleSize: function bubbleSize() {
      return {
        width: this.size + "px",
        height: this.size + "px"
      };
    },
    bubblePad: function bubblePad() {
      return {
        padding: this.size / 10 + "px"
      };
    }
  },

  methods: {
    // color format

    tc: function tc(e) {
      var f = tinycolor(e);

      if (f.isValid()) {
        return f;
      }
    },
    formatColor: function formatColor(e) {
      if (this.codeFormat == "rgb") {
        return this.tc(e).toHexString();
      }

      return this.tc(e).toHex8String();
    },

    // color ops
    namesAjaxCall: function namesAjaxCall(arr) {
      var _this = this;

      var list = arr.map(function (el) {
        return _this.tc(el).toHex();
      });

      var url = "https://color-names.herokuapp.com/v1/" + list.join(',');
      var vm = this;
      var xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          return vm.colorsNames = JSON.parse(this.response).colors;
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send();
    },
    getColorName: function getColorName(e) {
      var v = this.tc(e).toHexString();
      var cn = this.colorsNames;

      if (cn.length) {
        var found = cn.find(function (el) {
          return el.requestedHex == v;
        });

        return found.name;
      }
    },
    copyColor: function copyColor(item) {
      new Clipboard(".item");
      this.notifs.push({
        text: item + " copied",
        show: true
      });
    },
    removeColor: function removeColor(item) {
      var index = this.colorsList.indexOf(item);

      this.removedColors.push({ i: index, v: item });
      this.colorsList.splice(index, 1);

      this.showSaveBtn = true;
    },
    undoRemovedColor: function undoRemovedColor() {
      var item = this.removedColors[this.removedColors.length - 1];
      var index = this.removedColors.indexOf(item);

      this.removedColors.splice(index, 1);
      this.colorsList.splice(item.i, 0, item.v);
    },

    // notif
    hideNotif: function hideNotif(i) {
      var _this2 = this;

      setTimeout(function () {
        return _this2.notifs[i].show = false;
      }, this.notifDur);

      return this.notifs[i].show;
    },

    // save list to desktop
    saveList: function saveList() {
      var current = this.colorsList.join("\n");
      var removed = this.removedColors.map(function (e) {
        return e.v;
      }).join("\n");

      var str = current + "\n\n💩Removed\n\n" + removed + "\n";

      var blob = new Blob([str], { type: "text/plaincharset=utf-8" });
      saveAs(blob, "colors-vis-List.txt");

      this.notifs.push({
        text: "File Saved To Desktop",
        show: true
      });
    },

    // because vue cant handle this on its own
    handleClick: function handleClick(e, color) {
      if (e.shiftKey) {
        return this.removeColor(color);
      }

      this.copyColor(this.formatColor(color));
    }
  },

  watch: {
    bg: function bg(val) {
      body.style.background = this.tc(val);
    },
    txt: function txt(val) {
      body.style.color = this.tc(val);
    },
    rawList: function rawList(val) {
      if (val !== "") {
        return this.colorsList = val.split("\n");
      }

      return this.colorsList = [];
    },
    colorsList: function colorsList(val) {
      if (val.length) {
        if (val == this.rawList.split("\n").toString()) {
          this.showSaveBtn = false;
        }

        this.namesAjaxCall(val);
      }
    }
  }
});

// TODO
// text in contrast to the circle bg color
// make grid like apple iwatch bubbles
// blend colors