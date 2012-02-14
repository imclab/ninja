/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var HotText = require("js/components/hottext.reel").HotText;

var HotTextUnit = exports.HotTextUnit = Montage.create(HotText, {

    numericField: {
        enumerable: false,
        value:null
    },

    unitsField: {
        enumerable: false,
        value:null
    },

    inputField: {
        enumerable: false,
        value:null
    },

    _units: {
        enumerable: false,
        value: "px"
    },

    units: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._units;
        },
        set: function(value) {
            if (value !== this._units) {
                if(this._acceptableUnits.indexOf(value) !== -1)
                {
                    this._units = value;
                    this.needsDraw = true;

                    this._setEventFlags("change", false);
                    this._dispatchActionEvent();
                }
            }
        }
    },

    // Some controls will only support certain units
    // For example, Oval would specify an innerRadius with acceptableUnits = ["%"]
    // and Stroke Size with acceptableUnits = ["px", "pt", "%"]
    _acceptableUnits: {
        enumerable: false,
        value: ["px"]
    },


    acceptableUnits: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._acceptableUnits;
        },
        set: function(value) {
            if (value !== this._acceptableUnits) {
                this._acceptableUnits = value;
            }
        }
    },

    // We don't want to handle every input; we only want to handle input from tab or enter
    // Thus, we don't listen for an input event; we call this from handleKeydown
    handleInput: {
        enumerable: false,
        value: function() {
            var inputString = this.inputField.value;

            // Ignore all whitespace, digits, negative sign and "." when looking for units label
            // The units must come after one or more digits
            var objRegExp = /(\-*\d+\.*\d*)(\s*)(\w*\%*)/;
            var unitsString = inputString.replace(objRegExp, "$3");
            if(unitsString)
            {
                var noSpaces = /(\s*)(\S*)(\s*)/;
                // strip out spaces and convert to lower case
                var match = (unitsString.replace(noSpaces, "$2")).toLowerCase();
                if(match)
                {
                    Object.getPropertyDescriptor(this, "units").set.call(this, match);
                }
            }

            this._setEventFlags("change", false);
            // Moving this call to after setting the value since value changes are dispatching events before units are set
            Object.getPropertyDescriptor(this, "value").set.call(this, this.inputFunction(inputString), false);
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            this.inputField.value = this._value + " " + this._units;
            this.numericField.innerText = this._value;
            this.unitsField.innerText = " " + this._units;


            if(this._hasFocus)
            {
                this.numericField.classList.add("hide");
                this.unitsField.classList.add("hide");

                this.inputField.classList.remove("hide");

                // if element targeted; balancing demands of multitouch
                // with traditional single focus model
                this.inputField.addEventListener("keydown", this, false);
            }
            else
            {
                this.numericField.classList.remove("hide");
                this.unitsField.classList.remove("hide");

                this.inputField.classList.add("hide");
            }
        }
    },

    didDraw: {
        enumerable: false,
        value: function() {
            if(this._hasFocus)
            {
                var length = 0;
                if(this.labelFunction)
                {
                    length = this.labelFunction(this._value).length;
                }
                else
                {
                    length = this.inputField.value.toString().length;
                }
                this.inputField.setSelectionRange(0, length);
            }
            this._valueSyncedWithInputField = true;
        }
    },

    prepareForDraw: {
        value: function() {
            this.numericField = document.createElement("span");
            this.numericField.classList.add("underline");
            this.numericField.innerText = this._value;

            this.unitsField = document.createElement("span");
            this.unitsField.innerText = " " + this._units;

            this.inputField = document.createElement("input");
            this.inputField.value = this._value + " " + this._units;
            this.inputField.classList.add("hide");

            this.element.appendChild(this.numericField);
            this.element.appendChild(this.unitsField);
            this.element.appendChild(this.inputField);


            if(this._value)
            {
                this._numValue = this._value;
            }

            if(this._enabled)
            {
                this.element.addEventListener("blur", this);
                this.element.addEventListener("focus", this);

                this.element.addEventListener("touchstart", this, false);
                this.element.addEventListener("mousedown", this, false);
            }
        }
    }

});
