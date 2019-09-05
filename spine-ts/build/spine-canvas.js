var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var spine;
(function (spine) {
    var Animation = (function () {
        function Animation(name, timelines, duration) {
            if (name == null)
                throw new Error("name cannot be null.");
            if (timelines == null)
                throw new Error("timelines cannot be null.");
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        }
        Animation.prototype.apply = function (skeleton, lastTime, time, loop, events, alpha, blend, direction) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (loop && this.duration != 0) {
                time %= this.duration;
                if (lastTime > 0)
                    lastTime %= this.duration;
            }
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, alpha, blend, direction);
        };
        Animation.binarySearch = function (values, target, step) {
            if (step === void 0) { step = 1; }
            var low = 0;
            var high = values.length / step - 2;
            if (high == 0)
                return step;
            var current = high >>> 1;
            while (true) {
                if (values[(current + 1) * step] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return (low + 1) * step;
                current = (low + high) >>> 1;
            }
        };
        Animation.linearSearch = function (values, target, step) {
            for (var i = 0, last = values.length - step; i <= last; i += step)
                if (values[i] > target)
                    return i;
            return -1;
        };
        return Animation;
    }());
    spine.Animation = Animation;
    var MixBlend;
    (function (MixBlend) {
        MixBlend[MixBlend["setup"] = 0] = "setup";
        MixBlend[MixBlend["first"] = 1] = "first";
        MixBlend[MixBlend["replace"] = 2] = "replace";
        MixBlend[MixBlend["add"] = 3] = "add";
    })(MixBlend = spine.MixBlend || (spine.MixBlend = {}));
    var MixDirection;
    (function (MixDirection) {
        MixDirection[MixDirection["mixIn"] = 0] = "mixIn";
        MixDirection[MixDirection["mixOut"] = 1] = "mixOut";
    })(MixDirection = spine.MixDirection || (spine.MixDirection = {}));
    var TimelineType;
    (function (TimelineType) {
        TimelineType[TimelineType["rotate"] = 0] = "rotate";
        TimelineType[TimelineType["translate"] = 1] = "translate";
        TimelineType[TimelineType["scale"] = 2] = "scale";
        TimelineType[TimelineType["shear"] = 3] = "shear";
        TimelineType[TimelineType["attachment"] = 4] = "attachment";
        TimelineType[TimelineType["color"] = 5] = "color";
        TimelineType[TimelineType["deform"] = 6] = "deform";
        TimelineType[TimelineType["event"] = 7] = "event";
        TimelineType[TimelineType["drawOrder"] = 8] = "drawOrder";
        TimelineType[TimelineType["ikConstraint"] = 9] = "ikConstraint";
        TimelineType[TimelineType["transformConstraint"] = 10] = "transformConstraint";
        TimelineType[TimelineType["pathConstraintPosition"] = 11] = "pathConstraintPosition";
        TimelineType[TimelineType["pathConstraintSpacing"] = 12] = "pathConstraintSpacing";
        TimelineType[TimelineType["pathConstraintMix"] = 13] = "pathConstraintMix";
        TimelineType[TimelineType["twoColor"] = 14] = "twoColor";
    })(TimelineType = spine.TimelineType || (spine.TimelineType = {}));
    var CurveTimeline = (function () {
        function CurveTimeline(frameCount) {
            if (frameCount <= 0)
                throw new Error("frameCount must be > 0: " + frameCount);
            this.curves = spine.Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
        }
        CurveTimeline.prototype.getFrameCount = function () {
            return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
        };
        CurveTimeline.prototype.setLinear = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
        };
        CurveTimeline.prototype.setStepped = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
        };
        CurveTimeline.prototype.getCurveType = function (frameIndex) {
            var index = frameIndex * CurveTimeline.BEZIER_SIZE;
            if (index == this.curves.length)
                return CurveTimeline.LINEAR;
            var type = this.curves[index];
            if (type == CurveTimeline.LINEAR)
                return CurveTimeline.LINEAR;
            if (type == CurveTimeline.STEPPED)
                return CurveTimeline.STEPPED;
            return CurveTimeline.BEZIER;
        };
        CurveTimeline.prototype.setCurve = function (frameIndex, cx1, cy1, cx2, cy2) {
            var tmpx = (-cx1 * 2 + cx2) * 0.03, tmpy = (-cy1 * 2 + cy2) * 0.03;
            var dddfx = ((cx1 - cx2) * 3 + 1) * 0.006, dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
            var ddfx = tmpx * 2 + dddfx, ddfy = tmpy * 2 + dddfy;
            var dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var curves = this.curves;
            curves[i++] = CurveTimeline.BEZIER;
            var x = dfx, y = dfy;
            for (var n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
        };
        CurveTimeline.prototype.getCurvePercent = function (frameIndex, percent) {
            percent = spine.MathUtils.clamp(percent, 0, 1);
            var curves = this.curves;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var type = curves[i];
            if (type == CurveTimeline.LINEAR)
                return percent;
            if (type == CurveTimeline.STEPPED)
                return 0;
            i++;
            var x = 0;
            for (var start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                x = curves[i];
                if (x >= percent) {
                    var prevX = void 0, prevY = void 0;
                    if (i == start) {
                        prevX = 0;
                        prevY = 0;
                    }
                    else {
                        prevX = curves[i - 2];
                        prevY = curves[i - 1];
                    }
                    return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
                }
            }
            var y = curves[i - 1];
            return y + (1 - y) * (percent - x) / (1 - x);
        };
        CurveTimeline.LINEAR = 0;
        CurveTimeline.STEPPED = 1;
        CurveTimeline.BEZIER = 2;
        CurveTimeline.BEZIER_SIZE = 10 * 2 - 1;
        return CurveTimeline;
    }());
    spine.CurveTimeline = CurveTimeline;
    var RotateTimeline = (function (_super) {
        __extends(RotateTimeline, _super);
        function RotateTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount << 1);
            return _this;
        }
        RotateTimeline.prototype.getPropertyId = function () {
            return (TimelineType.rotate << 24) + this.boneIndex;
        };
        RotateTimeline.prototype.setFrame = function (frameIndex, time, degrees) {
            frameIndex <<= 1;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
        };
        RotateTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                        return;
                    case MixBlend.first:
                        var r_1 = bone.data.rotation - bone.rotation;
                        bone.rotation += (r_1 - (16384 - ((16384.499999999996 - r_1 / 360) | 0)) * 360) * alpha;
                }
                return;
            }
            if (time >= frames[frames.length - RotateTimeline.ENTRIES]) {
                var r_2 = frames[frames.length + RotateTimeline.PREV_ROTATION];
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation + r_2 * alpha;
                        break;
                    case MixBlend.first:
                    case MixBlend.replace:
                        r_2 += bone.data.rotation - bone.rotation;
                        r_2 -= (16384 - ((16384.499999999996 - r_2 / 360) | 0)) * 360;
                    case MixBlend.add:
                        bone.rotation += r_2 * alpha;
                }
                return;
            }
            var frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
            var prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));
            var r = frames[frame + RotateTimeline.ROTATION] - prevRotation;
            r = prevRotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * percent;
            switch (blend) {
                case MixBlend.setup:
                    bone.rotation = bone.data.rotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    r += bone.data.rotation - bone.rotation;
                case MixBlend.add:
                    bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
            }
        };
        RotateTimeline.ENTRIES = 2;
        RotateTimeline.PREV_TIME = -2;
        RotateTimeline.PREV_ROTATION = -1;
        RotateTimeline.ROTATION = 1;
        return RotateTimeline;
    }(CurveTimeline));
    spine.RotateTimeline = RotateTimeline;
    var TranslateTimeline = (function (_super) {
        __extends(TranslateTimeline, _super);
        function TranslateTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
            return _this;
        }
        TranslateTimeline.prototype.getPropertyId = function () {
            return (TimelineType.translate << 24) + this.boneIndex;
        };
        TranslateTimeline.prototype.setFrame = function (frameIndex, time, x, y) {
            frameIndex *= TranslateTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TranslateTimeline.X] = x;
            this.frames[frameIndex + TranslateTimeline.Y] = y;
        };
        TranslateTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.x = bone.data.x;
                        bone.y = bone.data.y;
                        return;
                    case MixBlend.first:
                        bone.x += (bone.data.x - bone.x) * alpha;
                        bone.y += (bone.data.y - bone.y) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) {
                x = frames[frames.length + TranslateTimeline.PREV_X];
                y = frames[frames.length + TranslateTimeline.PREV_Y];
            }
            else {
                var frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
                x = frames[frame + TranslateTimeline.PREV_X];
                y = frames[frame + TranslateTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));
                x += (frames[frame + TranslateTimeline.X] - x) * percent;
                y += (frames[frame + TranslateTimeline.Y] - y) * percent;
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.x = bone.data.x + x * alpha;
                    bone.y = bone.data.y + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.x += (bone.data.x + x - bone.x) * alpha;
                    bone.y += (bone.data.y + y - bone.y) * alpha;
                    break;
                case MixBlend.add:
                    bone.x += x * alpha;
                    bone.y += y * alpha;
            }
        };
        TranslateTimeline.ENTRIES = 3;
        TranslateTimeline.PREV_TIME = -3;
        TranslateTimeline.PREV_X = -2;
        TranslateTimeline.PREV_Y = -1;
        TranslateTimeline.X = 1;
        TranslateTimeline.Y = 2;
        return TranslateTimeline;
    }(CurveTimeline));
    spine.TranslateTimeline = TranslateTimeline;
    var ScaleTimeline = (function (_super) {
        __extends(ScaleTimeline, _super);
        function ScaleTimeline(frameCount) {
            return _super.call(this, frameCount) || this;
        }
        ScaleTimeline.prototype.getPropertyId = function () {
            return (TimelineType.scale << 24) + this.boneIndex;
        };
        ScaleTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.scaleX = bone.data.scaleX;
                        bone.scaleY = bone.data.scaleY;
                        return;
                    case MixBlend.first:
                        bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
                        bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) {
                x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
                y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
            }
            else {
                var frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
                x = frames[frame + ScaleTimeline.PREV_X];
                y = frames[frame + ScaleTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ScaleTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime));
                x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
                y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
            }
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    bone.scaleX += x - bone.data.scaleX;
                    bone.scaleY += y - bone.data.scaleY;
                }
                else {
                    bone.scaleX = x;
                    bone.scaleY = y;
                }
            }
            else {
                var bx = 0, by = 0;
                if (direction == MixDirection.mixOut) {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = bone.data.scaleX;
                            by = bone.data.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.add:
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bone.data.scaleX) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - bone.data.scaleY) * alpha;
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = Math.abs(bone.data.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.data.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = Math.abs(bone.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.add:
                            bx = spine.MathUtils.signum(x);
                            by = spine.MathUtils.signum(y);
                            bone.scaleX = Math.abs(bone.scaleX) * bx + (x - Math.abs(bone.data.scaleX) * bx) * alpha;
                            bone.scaleY = Math.abs(bone.scaleY) * by + (y - Math.abs(bone.data.scaleY) * by) * alpha;
                    }
                }
            }
        };
        return ScaleTimeline;
    }(TranslateTimeline));
    spine.ScaleTimeline = ScaleTimeline;
    var ShearTimeline = (function (_super) {
        __extends(ShearTimeline, _super);
        function ShearTimeline(frameCount) {
            return _super.call(this, frameCount) || this;
        }
        ShearTimeline.prototype.getPropertyId = function () {
            return (TimelineType.shear << 24) + this.boneIndex;
        };
        ShearTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.shearX = bone.data.shearX;
                        bone.shearY = bone.data.shearY;
                        return;
                    case MixBlend.first:
                        bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
                        bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ShearTimeline.ENTRIES]) {
                x = frames[frames.length + ShearTimeline.PREV_X];
                y = frames[frames.length + ShearTimeline.PREV_Y];
            }
            else {
                var frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
                x = frames[frame + ShearTimeline.PREV_X];
                y = frames[frame + ShearTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));
                x = x + (frames[frame + ShearTimeline.X] - x) * percent;
                y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.shearX = bone.data.shearX + x * alpha;
                    bone.shearY = bone.data.shearY + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
                    bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
                    break;
                case MixBlend.add:
                    bone.shearX += x * alpha;
                    bone.shearY += y * alpha;
            }
        };
        return ShearTimeline;
    }(TranslateTimeline));
    spine.ShearTimeline = ShearTimeline;
    var ColorTimeline = (function (_super) {
        __extends(ColorTimeline, _super);
        function ColorTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
            return _this;
        }
        ColorTimeline.prototype.getPropertyId = function () {
            return (TimelineType.color << 24) + this.slotIndex;
        };
        ColorTimeline.prototype.setFrame = function (frameIndex, time, a) {
            frameIndex *= ColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + ColorTimeline.A] = a;
        };
        ColorTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            var frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        slot.color.setFromColor(slot.data.color);
                        return;
                    case MixBlend.first:
                        var color = slot.color, setup = slot.data.color;
                        color.add((setup.a - color.a) * alpha);
                }
                return;
            }
            var a = 0;
            if (time >= frames[frames.length - ColorTimeline.ENTRIES]) {
                var i = frames.length;
                a = frames[i + ColorTimeline.PREV_A];
            }
            else {
                var frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
                a = frames[frame + ColorTimeline.PREV_A];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));
                a += (frames[frame + ColorTimeline.A] - a) * percent;
            }
            if (alpha == 1)
                slot.color.set(a);
            else {
                var color = slot.color;
                if (blend == MixBlend.setup)
                    color.setFromColor(slot.data.color);
                color.add((a - color.a) * alpha);
            }
        };
        ColorTimeline.ENTRIES = 5;
        ColorTimeline.PREV_TIME = -5;
        ColorTimeline.PREV_A = -1;
        ColorTimeline.A = 4;
        return ColorTimeline;
    }(CurveTimeline));
    spine.ColorTimeline = ColorTimeline;
    var AttachmentTimeline = (function () {
        function AttachmentTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.attachmentNames = new Array(frameCount);
        }
        AttachmentTimeline.prototype.getPropertyId = function () {
            return (TimelineType.attachment << 24) + this.slotIndex;
        };
        AttachmentTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        AttachmentTimeline.prototype.setFrame = function (frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        };
        AttachmentTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            if (direction == MixDirection.mixOut && blend == MixBlend.setup) {
                var attachmentName_1 = slot.data.attachmentName;
                slot.setAttachment(attachmentName_1 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_1));
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first) {
                    var attachmentName_2 = slot.data.attachmentName;
                    slot.setAttachment(attachmentName_2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_2));
                }
                return;
            }
            var frameIndex = 0;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
            else
                frameIndex = Animation.binarySearch(frames, time, 1) - 1;
            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex]
                .setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        };
        return AttachmentTimeline;
    }());
    spine.AttachmentTimeline = AttachmentTimeline;
    var zeros = null;
    var EventTimeline = (function () {
        function EventTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.events = new Array(frameCount);
        }
        EventTimeline.prototype.getPropertyId = function () {
            return TimelineType.event << 24;
        };
        EventTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        EventTimeline.prototype.setFrame = function (frameIndex, event) {
            this.frames[frameIndex] = event.time;
            this.events[frameIndex] = event;
        };
        EventTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (firedEvents == null)
                return;
            var frames = this.frames;
            var frameCount = this.frames.length;
            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frameCount - 1])
                return;
            if (time < frames[0])
                return;
            var frame = 0;
            if (lastTime < frames[0])
                frame = 0;
            else {
                frame = Animation.binarySearch(frames, lastTime);
                var frameTime = frames[frame];
                while (frame > 0) {
                    if (frames[frame - 1] != frameTime)
                        break;
                    frame--;
                }
            }
            for (; frame < frameCount && time >= frames[frame]; frame++)
                firedEvents.push(this.events[frame]);
        };
        return EventTimeline;
    }());
    spine.EventTimeline = EventTimeline;
    var DrawOrderTimeline = (function () {
        function DrawOrderTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.drawOrders = new Array(frameCount);
        }
        DrawOrderTimeline.prototype.getPropertyId = function () {
            return TimelineType.drawOrder << 24;
        };
        DrawOrderTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        DrawOrderTimeline.prototype.setFrame = function (frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        };
        DrawOrderTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var drawOrder = skeleton.drawOrder;
            var slots = skeleton.slots;
            if (direction == MixDirection.mixOut && blend == MixBlend.setup) {
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frame = 0;
            if (time >= frames[frames.length - 1])
                frame = frames.length - 1;
            else
                frame = Animation.binarySearch(frames, time) - 1;
            var drawOrderToSetupIndex = this.drawOrders[frame];
            if (drawOrderToSetupIndex == null)
                spine.Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
            else {
                for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        };
        return DrawOrderTimeline;
    }());
    spine.DrawOrderTimeline = DrawOrderTimeline;
    var IkConstraintTimeline = (function (_super) {
        __extends(IkConstraintTimeline, _super);
        function IkConstraintTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * IkConstraintTimeline.ENTRIES);
            return _this;
        }
        IkConstraintTimeline.prototype.getPropertyId = function () {
            return (TimelineType.ikConstraint << 24) + this.ikConstraintIndex;
        };
        IkConstraintTimeline.prototype.setFrame = function (frameIndex, time, mix, softness, bendDirection, compress, stretch) {
            frameIndex *= IkConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + IkConstraintTimeline.MIX] = mix;
            this.frames[frameIndex + IkConstraintTimeline.SOFTNESS] = softness;
            this.frames[frameIndex + IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
            this.frames[frameIndex + IkConstraintTimeline.COMPRESS] = compress ? 1 : 0;
            this.frames[frameIndex + IkConstraintTimeline.STRETCH] = stretch ? 1 : 0;
        };
        IkConstraintTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.ikConstraints[this.ikConstraintIndex];
            if (!constraint.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mix = constraint.data.mix;
                        constraint.softness = constraint.data.softness;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                        return;
                    case MixBlend.first:
                        constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
                        constraint.softness += (constraint.data.softness - constraint.softness) * alpha;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                }
                return;
            }
            if (time >= frames[frames.length - IkConstraintTimeline.ENTRIES]) {
                if (blend == MixBlend.setup) {
                    constraint.mix = constraint.data.mix + (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
                    constraint.softness = constraint.data.softness
                        + (frames[frames.length + IkConstraintTimeline.PREV_SOFTNESS] - constraint.data.softness) * alpha;
                    if (direction == MixDirection.mixOut) {
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                    }
                    else {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                else {
                    constraint.mix += (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
                    constraint.softness += (frames[frames.length + IkConstraintTimeline.PREV_SOFTNESS] - constraint.softness) * alpha;
                    if (direction == MixDirection.mixIn) {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                return;
            }
            var frame = Animation.binarySearch(frames, time, IkConstraintTimeline.ENTRIES);
            var mix = frames[frame + IkConstraintTimeline.PREV_MIX];
            var softness = frames[frame + IkConstraintTimeline.PREV_SOFTNESS];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / IkConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + IkConstraintTimeline.PREV_TIME] - frameTime));
            if (blend == MixBlend.setup) {
                constraint.mix = constraint.data.mix + (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
                constraint.softness = constraint.data.softness
                    + (softness + (frames[frame + IkConstraintTimeline.SOFTNESS] - softness) * percent - constraint.data.softness) * alpha;
                if (direction == MixDirection.mixOut) {
                    constraint.bendDirection = constraint.data.bendDirection;
                    constraint.compress = constraint.data.compress;
                    constraint.stretch = constraint.data.stretch;
                }
                else {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
            else {
                constraint.mix += (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
                constraint.softness += (softness + (frames[frame + IkConstraintTimeline.SOFTNESS] - softness) * percent - constraint.softness) * alpha;
                if (direction == MixDirection.mixIn) {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
        };
        IkConstraintTimeline.ENTRIES = 6;
        IkConstraintTimeline.PREV_TIME = -6;
        IkConstraintTimeline.PREV_MIX = -5;
        IkConstraintTimeline.PREV_SOFTNESS = -4;
        IkConstraintTimeline.PREV_BEND_DIRECTION = -3;
        IkConstraintTimeline.PREV_COMPRESS = -2;
        IkConstraintTimeline.PREV_STRETCH = -1;
        IkConstraintTimeline.MIX = 1;
        IkConstraintTimeline.SOFTNESS = 2;
        IkConstraintTimeline.BEND_DIRECTION = 3;
        IkConstraintTimeline.COMPRESS = 4;
        IkConstraintTimeline.STRETCH = 5;
        return IkConstraintTimeline;
    }(CurveTimeline));
    spine.IkConstraintTimeline = IkConstraintTimeline;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var AnimationState = (function () {
        function AnimationState(data) {
            this.tracks = new Array();
            this.events = new Array();
            this.listeners = new Array();
            this.queue = new EventQueue(this);
            this.propertyIDs = new spine.IntSet();
            this.animationsChanged = false;
            this.timeScale = 1;
            this.trackEntryPool = new spine.Pool(function () { return new TrackEntry(); });
            this.data = data;
        }
        AnimationState.prototype.update = function (delta) {
            delta *= this.timeScale;
            var tracks = this.tracks;
            for (var i = 0, n = tracks.length; i < n; i++) {
                var current = tracks[i];
                if (current == null)
                    continue;
                current.animationLast = current.nextAnimationLast;
                current.trackLast = current.nextTrackLast;
                var currentDelta = delta * current.timeScale;
                if (current.delay > 0) {
                    current.delay -= currentDelta;
                    if (current.delay > 0)
                        continue;
                    currentDelta = -current.delay;
                    current.delay = 0;
                }
                var next = current.next;
                if (next != null) {
                    var nextTime = current.trackLast - next.delay;
                    if (nextTime >= 0) {
                        next.delay = 0;
                        next.trackTime = current.timeScale == 0 ? 0 : (nextTime / current.timeScale + delta) * next.timeScale;
                        current.trackTime += currentDelta;
                        this.setCurrent(i, next, true);
                        while (next.mixingFrom != null) {
                            next.mixTime += delta;
                            next = next.mixingFrom;
                        }
                        continue;
                    }
                }
                else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
                    tracks[i] = null;
                    this.queue.end(current);
                    this.disposeNext(current);
                    continue;
                }
                if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
                    var from = current.mixingFrom;
                    current.mixingFrom = null;
                    if (from != null)
                        from.mixingTo = null;
                    while (from != null) {
                        this.queue.end(from);
                        from = from.mixingFrom;
                    }
                }
                current.trackTime += currentDelta;
            }
            this.queue.drain();
        };
        AnimationState.prototype.updateMixingFrom = function (to, delta) {
            var from = to.mixingFrom;
            if (from == null)
                return true;
            var finished = this.updateMixingFrom(from, delta);
            from.animationLast = from.nextAnimationLast;
            from.trackLast = from.nextTrackLast;
            if (to.mixTime > 0 && to.mixTime >= to.mixDuration) {
                if (from.totalAlpha == 0 || to.mixDuration == 0) {
                    to.mixingFrom = from.mixingFrom;
                    if (from.mixingFrom != null)
                        from.mixingFrom.mixingTo = to;
                    to.interruptAlpha = from.interruptAlpha;
                    this.queue.end(from);
                }
                return finished;
            }
            from.trackTime += delta * from.timeScale;
            to.mixTime += delta;
            return false;
        };
        AnimationState.prototype.apply = function (skeleton) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (this.animationsChanged)
                this._animationsChanged();
            var events = this.events;
            var tracks = this.tracks;
            var applied = false;
            for (var i = 0, n = tracks.length; i < n; i++) {
                var current = tracks[i];
                if (current == null || current.delay > 0)
                    continue;
                applied = true;
                var blend = i == 0 ? spine.MixBlend.first : current.mixBlend;
                var mix = current.alpha;
                if (current.mixingFrom != null)
                    mix *= this.applyMixingFrom(current, skeleton, blend);
                else if (current.trackTime >= current.trackEnd && current.next == null)
                    mix = 0;
                var animationLast = current.animationLast, animationTime = current.getAnimationTime();
                var timelineCount = current.animation.timelines.length;
                var timelines = current.animation.timelines;
                if ((i == 0 && mix == 1) || blend == spine.MixBlend.add) {
                    for (var ii = 0; ii < timelineCount; ii++) {
                        spine.Utils.webkit602BugfixHelper(mix, blend);
                        timelines[ii].apply(skeleton, animationLast, animationTime, events, mix, blend, spine.MixDirection.mixIn);
                    }
                }
                else {
                    var timelineMode = current.timelineMode;
                    var firstFrame = current.timelinesRotation.length == 0;
                    if (firstFrame)
                        spine.Utils.setArraySize(current.timelinesRotation, timelineCount << 1, null);
                    var timelinesRotation = current.timelinesRotation;
                    for (var ii = 0; ii < timelineCount; ii++) {
                        var timeline = timelines[ii];
                        var timelineBlend = (timelineMode[ii] & (AnimationState.NOT_LAST - 1)) == AnimationState.SUBSEQUENT ? blend : spine.MixBlend.setup;
                        if (timeline instanceof spine.RotateTimeline) {
                            this.applyRotateTimeline(timeline, skeleton, animationTime, mix, timelineBlend, timelinesRotation, ii << 1, firstFrame);
                        }
                        else {
                            spine.Utils.webkit602BugfixHelper(mix, blend);
                            timeline.apply(skeleton, animationLast, animationTime, events, mix, timelineBlend, spine.MixDirection.mixIn);
                        }
                    }
                }
                this.queueEvents(current, animationTime);
                events.length = 0;
                current.nextAnimationLast = animationTime;
                current.nextTrackLast = current.trackTime;
            }
            this.queue.drain();
            return applied;
        };
        AnimationState.prototype.applyMixingFrom = function (to, skeleton, blend) {
            var from = to.mixingFrom;
            if (from.mixingFrom != null)
                this.applyMixingFrom(from, skeleton, blend);
            var mix = 0;
            if (to.mixDuration == 0) {
                mix = 1;
                if (blend == spine.MixBlend.first)
                    blend = spine.MixBlend.setup;
            }
            else {
                mix = to.mixTime / to.mixDuration;
                if (mix > 1)
                    mix = 1;
                if (blend != spine.MixBlend.first)
                    blend = from.mixBlend;
            }
            var events = mix < from.eventThreshold ? this.events : null;
            var attachments = mix < from.attachmentThreshold, drawOrder = mix < from.drawOrderThreshold;
            var animationLast = from.animationLast, animationTime = from.getAnimationTime();
            var timelineCount = from.animation.timelines.length;
            var timelines = from.animation.timelines;
            var alphaHold = from.alpha * to.interruptAlpha, alphaMix = alphaHold * (1 - mix);
            if (blend == spine.MixBlend.add) {
                for (var i = 0; i < timelineCount; i++)
                    timelines[i].apply(skeleton, animationLast, animationTime, events, alphaMix, blend, spine.MixDirection.mixOut);
            }
            else {
                var timelineMode = from.timelineMode;
                var timelineHoldMix = from.timelineHoldMix;
                var firstFrame = from.timelinesRotation.length == 0;
                if (firstFrame)
                    spine.Utils.setArraySize(from.timelinesRotation, timelineCount << 1, null);
                var timelinesRotation = from.timelinesRotation;
                from.totalAlpha = 0;
                for (var i = 0; i < timelineCount; i++) {
                    var timeline = timelines[i];
                    var direction = spine.MixDirection.mixOut;
                    var timelineBlend = void 0;
                    var alpha = 0;
                    switch (timelineMode[i] & (AnimationState.NOT_LAST - 1)) {
                        case AnimationState.SUBSEQUENT:
                            if (!attachments && timeline instanceof spine.AttachmentTimeline) {
                                if ((timelineMode[i] & AnimationState.NOT_LAST) == AnimationState.NOT_LAST)
                                    continue;
                                blend = spine.MixBlend.setup;
                            }
                            if (!drawOrder && timeline instanceof spine.DrawOrderTimeline)
                                continue;
                            timelineBlend = blend;
                            alpha = alphaMix;
                            break;
                        case AnimationState.FIRST:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaMix;
                            break;
                        case AnimationState.HOLD:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaHold;
                            break;
                        default:
                            timelineBlend = spine.MixBlend.setup;
                            var holdMix = timelineHoldMix[i];
                            alpha = alphaHold * Math.max(0, 1 - holdMix.mixTime / holdMix.mixDuration);
                            break;
                    }
                    from.totalAlpha += alpha;
                    if (timeline instanceof spine.RotateTimeline)
                        this.applyRotateTimeline(timeline, skeleton, animationTime, alpha, timelineBlend, timelinesRotation, i << 1, firstFrame);
                    else {
                        spine.Utils.webkit602BugfixHelper(alpha, blend);
                        if (timelineBlend == spine.MixBlend.setup) {
                            if (timeline instanceof spine.AttachmentTimeline) {
                                if (attachments || (timelineMode[i] & AnimationState.NOT_LAST) == AnimationState.NOT_LAST)
                                    direction = spine.MixDirection.mixIn;
                            }
                            else if (timeline instanceof spine.DrawOrderTimeline) {
                                if (drawOrder)
                                    direction = spine.MixDirection.mixIn;
                            }
                        }
                        timeline.apply(skeleton, animationLast, animationTime, events, alpha, timelineBlend, direction);
                    }
                }
            }
            if (to.mixDuration > 0)
                this.queueEvents(from, animationTime);
            this.events.length = 0;
            from.nextAnimationLast = animationTime;
            from.nextTrackLast = from.trackTime;
            return mix;
        };
        AnimationState.prototype.applyRotateTimeline = function (timeline, skeleton, time, alpha, blend, timelinesRotation, i, firstFrame) {
            if (firstFrame)
                timelinesRotation[i] = 0;
            if (alpha == 1) {
                timeline.apply(skeleton, 0, time, null, 1, blend, spine.MixDirection.mixIn);
                return;
            }
            var rotateTimeline = timeline;
            var frames = rotateTimeline.frames;
            var bone = skeleton.bones[rotateTimeline.boneIndex];
            if (!bone.active)
                return;
            var r1 = 0, r2 = 0;
            if (time < frames[0]) {
                switch (blend) {
                    case spine.MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                    default:
                        return;
                    case spine.MixBlend.first:
                        r1 = bone.rotation;
                        r2 = bone.data.rotation;
                }
            }
            else {
                r1 = blend == spine.MixBlend.setup ? bone.data.rotation : bone.rotation;
                if (time >= frames[frames.length - spine.RotateTimeline.ENTRIES])
                    r2 = bone.data.rotation + frames[frames.length + spine.RotateTimeline.PREV_ROTATION];
                else {
                    var frame = spine.Animation.binarySearch(frames, time, spine.RotateTimeline.ENTRIES);
                    var prevRotation = frames[frame + spine.RotateTimeline.PREV_ROTATION];
                    var frameTime = frames[frame];
                    var percent = rotateTimeline.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + spine.RotateTimeline.PREV_TIME] - frameTime));
                    r2 = frames[frame + spine.RotateTimeline.ROTATION] - prevRotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                    r2 = prevRotation + r2 * percent + bone.data.rotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                }
            }
            var total = 0, diff = r2 - r1;
            diff -= (16384 - ((16384.499999999996 - diff / 360) | 0)) * 360;
            if (diff == 0) {
                total = timelinesRotation[i];
            }
            else {
                var lastTotal = 0, lastDiff = 0;
                if (firstFrame) {
                    lastTotal = 0;
                    lastDiff = diff;
                }
                else {
                    lastTotal = timelinesRotation[i];
                    lastDiff = timelinesRotation[i + 1];
                }
                var current = diff > 0, dir = lastTotal >= 0;
                if (spine.MathUtils.signum(lastDiff) != spine.MathUtils.signum(diff) && Math.abs(lastDiff) <= 90) {
                    if (Math.abs(lastTotal) > 180)
                        lastTotal += 360 * spine.MathUtils.signum(lastTotal);
                    dir = current;
                }
                total = diff + lastTotal - lastTotal % 360;
                if (dir != current)
                    total += 360 * spine.MathUtils.signum(lastTotal);
                timelinesRotation[i] = total;
            }
            timelinesRotation[i + 1] = diff;
            r1 += total * alpha;
            bone.rotation = r1 - (16384 - ((16384.499999999996 - r1 / 360) | 0)) * 360;
        };
        AnimationState.prototype.queueEvents = function (entry, animationTime) {
            var animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            var duration = animationEnd - animationStart;
            var trackLastWrapped = entry.trackLast % duration;
            var events = this.events;
            var i = 0, n = events.length;
            for (; i < n; i++) {
                var event_1 = events[i];
                if (event_1.time < trackLastWrapped)
                    break;
                if (event_1.time > animationEnd)
                    continue;
                this.queue.event(entry, event_1);
            }
            var complete = false;
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete)
                this.queue.complete(entry);
            for (; i < n; i++) {
                var event_2 = events[i];
                if (event_2.time < animationStart)
                    continue;
                this.queue.event(entry, events[i]);
            }
        };
        AnimationState.prototype.clearTracks = function () {
            var oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (var i = 0, n = this.tracks.length; i < n; i++)
                this.clearTrack(i);
            this.tracks.length = 0;
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        };
        AnimationState.prototype.clearTrack = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return;
            var current = this.tracks[trackIndex];
            if (current == null)
                return;
            this.queue.end(current);
            this.disposeNext(current);
            var entry = current;
            while (true) {
                var from = entry.mixingFrom;
                if (from == null)
                    break;
                this.queue.end(from);
                entry.mixingFrom = null;
                entry.mixingTo = null;
                entry = from;
            }
            this.tracks[current.trackIndex] = null;
            this.queue.drain();
        };
        AnimationState.prototype.setCurrent = function (index, current, interrupt) {
            var from = this.expandToIndex(index);
            this.tracks[index] = current;
            if (from != null) {
                if (interrupt)
                    this.queue.interrupt(from);
                current.mixingFrom = from;
                from.mixingTo = current;
                current.mixTime = 0;
                if (from.mixingFrom != null && from.mixDuration > 0)
                    current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
                from.timelinesRotation.length = 0;
            }
            this.queue.start(current);
        };
        AnimationState.prototype.setAnimation = function (trackIndex, animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.setAnimationWith(trackIndex, animation, loop);
        };
        AnimationState.prototype.setAnimationWith = function (trackIndex, animation, loop) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            var interrupt = true;
            var current = this.expandToIndex(trackIndex);
            if (current != null) {
                if (current.nextTrackLast == -1) {
                    this.tracks[trackIndex] = current.mixingFrom;
                    this.queue.interrupt(current);
                    this.queue.end(current);
                    this.disposeNext(current);
                    current = current.mixingFrom;
                    interrupt = false;
                }
                else
                    this.disposeNext(current);
            }
            var entry = this.trackEntry(trackIndex, animation, loop, current);
            this.setCurrent(trackIndex, entry, interrupt);
            this.queue.drain();
            return entry;
        };
        AnimationState.prototype.addAnimation = function (trackIndex, animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.addAnimationWith(trackIndex, animation, loop, delay);
        };
        AnimationState.prototype.addAnimationWith = function (trackIndex, animation, loop, delay) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            var last = this.expandToIndex(trackIndex);
            if (last != null) {
                while (last.next != null)
                    last = last.next;
            }
            var entry = this.trackEntry(trackIndex, animation, loop, last);
            if (last == null) {
                this.setCurrent(trackIndex, entry, true);
                this.queue.drain();
            }
            else {
                last.next = entry;
                if (delay <= 0) {
                    var duration = last.animationEnd - last.animationStart;
                    if (duration != 0) {
                        if (last.loop)
                            delay += duration * (1 + ((last.trackTime / duration) | 0));
                        else
                            delay += Math.max(duration, last.trackTime);
                        delay -= this.data.getMix(last.animation, animation);
                    }
                    else
                        delay = last.trackTime;
                }
            }
            entry.delay = delay;
            return entry;
        };
        AnimationState.prototype.setEmptyAnimation = function (trackIndex, mixDuration) {
            var entry = this.setAnimationWith(trackIndex, AnimationState.emptyAnimation, false);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        };
        AnimationState.prototype.addEmptyAnimation = function (trackIndex, mixDuration, delay) {
            if (delay <= 0)
                delay -= mixDuration;
            var entry = this.addAnimationWith(trackIndex, AnimationState.emptyAnimation, false, delay);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        };
        AnimationState.prototype.setEmptyAnimations = function (mixDuration) {
            var oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (var i = 0, n = this.tracks.length; i < n; i++) {
                var current = this.tracks[i];
                if (current != null)
                    this.setEmptyAnimation(current.trackIndex, mixDuration);
            }
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        };
        AnimationState.prototype.expandToIndex = function (index) {
            if (index < this.tracks.length)
                return this.tracks[index];
            spine.Utils.ensureArrayCapacity(this.tracks, index + 1, null);
            this.tracks.length = index + 1;
            return null;
        };
        AnimationState.prototype.trackEntry = function (trackIndex, animation, loop, last) {
            var entry = this.trackEntryPool.obtain();
            entry.trackIndex = trackIndex;
            entry.animation = animation;
            entry.loop = loop;
            entry.holdPrevious = false;
            entry.eventThreshold = 0;
            entry.attachmentThreshold = 0;
            entry.drawOrderThreshold = 0;
            entry.animationStart = 0;
            entry.animationEnd = animation.duration;
            entry.animationLast = -1;
            entry.nextAnimationLast = -1;
            entry.delay = 0;
            entry.trackTime = 0;
            entry.trackLast = -1;
            entry.nextTrackLast = -1;
            entry.trackEnd = Number.MAX_VALUE;
            entry.timeScale = 1;
            entry.alpha = 1;
            entry.interruptAlpha = 1;
            entry.mixTime = 0;
            entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
            return entry;
        };
        AnimationState.prototype.disposeNext = function (entry) {
            var next = entry.next;
            while (next != null) {
                this.queue.dispose(next);
                next = next.next;
            }
            entry.next = null;
        };
        AnimationState.prototype._animationsChanged = function () {
            this.animationsChanged = false;
            this.propertyIDs.clear();
            for (var i = 0, n = this.tracks.length; i < n; i++) {
                var entry = this.tracks[i];
                if (entry == null)
                    continue;
                while (entry.mixingFrom != null)
                    entry = entry.mixingFrom;
                do {
                    if (entry.mixingFrom == null || entry.mixBlend != spine.MixBlend.add)
                        this.computeHold(entry);
                    entry = entry.mixingTo;
                } while (entry != null);
            }
            this.propertyIDs.clear();
            for (var i = this.tracks.length - 1; i >= 0; i--) {
                var entry = this.tracks[i];
                while (entry != null) {
                    this.computeNotLast(entry);
                    entry = entry.mixingFrom;
                }
            }
        };
        AnimationState.prototype.computeHold = function (entry) {
            var to = entry.mixingTo;
            var timelines = entry.animation.timelines;
            var timelinesCount = entry.animation.timelines.length;
            var timelineMode = spine.Utils.setArraySize(entry.timelineMode, timelinesCount);
            entry.timelineHoldMix.length = 0;
            var timelineDipMix = spine.Utils.setArraySize(entry.timelineHoldMix, timelinesCount);
            var propertyIDs = this.propertyIDs;
            if (to != null && to.holdPrevious) {
                for (var i = 0; i < timelinesCount; i++) {
                    propertyIDs.add(timelines[i].getPropertyId());
                    timelineMode[i] = AnimationState.HOLD;
                }
                return;
            }
            outer: for (var i = 0; i < timelinesCount; i++) {
                var timeline = timelines[i];
                var id = timeline.getPropertyId();
                if (!propertyIDs.add(id))
                    timelineMode[i] = AnimationState.SUBSEQUENT;
                else if (to == null || timeline instanceof spine.AttachmentTimeline || timeline instanceof spine.DrawOrderTimeline
                    || timeline instanceof spine.EventTimeline || !this.hasTimeline(to, id)) {
                    timelineMode[i] = AnimationState.FIRST;
                }
                else {
                    for (var next = to.mixingTo; next != null; next = next.mixingTo) {
                        if (this.hasTimeline(next, id))
                            continue;
                        if (entry.mixDuration > 0) {
                            timelineMode[i] = AnimationState.HOLD_MIX;
                            timelineDipMix[i] = next;
                            continue outer;
                        }
                        break;
                    }
                    timelineMode[i] = AnimationState.HOLD;
                }
            }
        };
        AnimationState.prototype.computeNotLast = function (entry) {
            var timelines = entry.animation.timelines;
            var timelinesCount = entry.animation.timelines.length;
            var timelineMode = entry.timelineMode;
            var propertyIDs = this.propertyIDs;
            for (var i = 0; i < timelinesCount; i++) {
                if (timelines[i] instanceof spine.AttachmentTimeline) {
                    var timeline = timelines[i];
                    if (!propertyIDs.add(timeline.slotIndex))
                        timelineMode[i] |= AnimationState.NOT_LAST;
                }
            }
        };
        AnimationState.prototype.hasTimeline = function (entry, id) {
            var timelines = entry.animation.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                if (timelines[i].getPropertyId() == id)
                    return true;
            return false;
        };
        AnimationState.prototype.getCurrent = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return null;
            return this.tracks[trackIndex];
        };
        AnimationState.prototype.addListener = function (listener) {
            if (listener == null)
                throw new Error("listener cannot be null.");
            this.listeners.push(listener);
        };
        AnimationState.prototype.removeListener = function (listener) {
            var index = this.listeners.indexOf(listener);
            if (index >= 0)
                this.listeners.splice(index, 1);
        };
        AnimationState.prototype.clearListeners = function () {
            this.listeners.length = 0;
        };
        AnimationState.prototype.clearListenerNotifications = function () {
            this.queue.clear();
        };
        AnimationState.emptyAnimation = new spine.Animation("<empty>", [], 0);
        AnimationState.SUBSEQUENT = 0;
        AnimationState.FIRST = 1;
        AnimationState.HOLD = 2;
        AnimationState.HOLD_MIX = 3;
        AnimationState.NOT_LAST = 4;
        return AnimationState;
    }());
    spine.AnimationState = AnimationState;
    var TrackEntry = (function () {
        function TrackEntry() {
            this.mixBlend = spine.MixBlend.replace;
            this.timelineMode = new Array();
            this.timelineHoldMix = new Array();
            this.timelinesRotation = new Array();
        }
        TrackEntry.prototype.reset = function () {
            this.next = null;
            this.mixingFrom = null;
            this.mixingTo = null;
            this.animation = null;
            this.listener = null;
            this.timelineMode.length = 0;
            this.timelineHoldMix.length = 0;
            this.timelinesRotation.length = 0;
        };
        TrackEntry.prototype.getAnimationTime = function () {
            if (this.loop) {
                var duration = this.animationEnd - this.animationStart;
                if (duration == 0)
                    return this.animationStart;
                return (this.trackTime % duration) + this.animationStart;
            }
            return Math.min(this.trackTime + this.animationStart, this.animationEnd);
        };
        TrackEntry.prototype.setAnimationLast = function (animationLast) {
            this.animationLast = animationLast;
            this.nextAnimationLast = animationLast;
        };
        TrackEntry.prototype.isComplete = function () {
            return this.trackTime >= this.animationEnd - this.animationStart;
        };
        TrackEntry.prototype.resetRotationDirections = function () {
            this.timelinesRotation.length = 0;
        };
        return TrackEntry;
    }());
    spine.TrackEntry = TrackEntry;
    var EventQueue = (function () {
        function EventQueue(animState) {
            this.objects = [];
            this.drainDisabled = false;
            this.animState = animState;
        }
        EventQueue.prototype.start = function (entry) {
            this.objects.push(EventType.start);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        EventQueue.prototype.interrupt = function (entry) {
            this.objects.push(EventType.interrupt);
            this.objects.push(entry);
        };
        EventQueue.prototype.end = function (entry) {
            this.objects.push(EventType.end);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        EventQueue.prototype.dispose = function (entry) {
            this.objects.push(EventType.dispose);
            this.objects.push(entry);
        };
        EventQueue.prototype.complete = function (entry) {
            this.objects.push(EventType.complete);
            this.objects.push(entry);
        };
        EventQueue.prototype.event = function (entry, event) {
            this.objects.push(EventType.event);
            this.objects.push(entry);
            this.objects.push(event);
        };
        EventQueue.prototype.drain = function () {
            if (this.drainDisabled)
                return;
            this.drainDisabled = true;
            var objects = this.objects;
            var listeners = this.animState.listeners;
            for (var i = 0; i < objects.length; i += 2) {
                var type = objects[i];
                var entry = objects[i + 1];
                switch (type) {
                    case EventType.start:
                        if (entry.listener != null && entry.listener.start)
                            entry.listener.start(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].start)
                                listeners[ii].start(entry);
                        break;
                    case EventType.interrupt:
                        if (entry.listener != null && entry.listener.interrupt)
                            entry.listener.interrupt(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].interrupt)
                                listeners[ii].interrupt(entry);
                        break;
                    case EventType.end:
                        if (entry.listener != null && entry.listener.end)
                            entry.listener.end(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].end)
                                listeners[ii].end(entry);
                    case EventType.dispose:
                        if (entry.listener != null && entry.listener.dispose)
                            entry.listener.dispose(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].dispose)
                                listeners[ii].dispose(entry);
                        this.animState.trackEntryPool.free(entry);
                        break;
                    case EventType.complete:
                        if (entry.listener != null && entry.listener.complete)
                            entry.listener.complete(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].complete)
                                listeners[ii].complete(entry);
                        break;
                    case EventType.event:
                        var event_3 = objects[i++ + 2];
                        if (entry.listener != null && entry.listener.event)
                            entry.listener.event(entry, event_3);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].event)
                                listeners[ii].event(entry, event_3);
                        break;
                }
            }
            this.clear();
            this.drainDisabled = false;
        };
        EventQueue.prototype.clear = function () {
            this.objects.length = 0;
        };
        return EventQueue;
    }());
    spine.EventQueue = EventQueue;
    var EventType;
    (function (EventType) {
        EventType[EventType["start"] = 0] = "start";
        EventType[EventType["interrupt"] = 1] = "interrupt";
        EventType[EventType["end"] = 2] = "end";
        EventType[EventType["dispose"] = 3] = "dispose";
        EventType[EventType["complete"] = 4] = "complete";
        EventType[EventType["event"] = 5] = "event";
    })(EventType = spine.EventType || (spine.EventType = {}));
    var AnimationStateAdapter2 = (function () {
        function AnimationStateAdapter2() {
        }
        AnimationStateAdapter2.prototype.start = function (entry) {
        };
        AnimationStateAdapter2.prototype.interrupt = function (entry) {
        };
        AnimationStateAdapter2.prototype.end = function (entry) {
        };
        AnimationStateAdapter2.prototype.dispose = function (entry) {
        };
        AnimationStateAdapter2.prototype.complete = function (entry) {
        };
        AnimationStateAdapter2.prototype.event = function (entry, event) {
        };
        return AnimationStateAdapter2;
    }());
    spine.AnimationStateAdapter2 = AnimationStateAdapter2;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var AnimationStateData = (function () {
        function AnimationStateData(skeletonData) {
            this.animationToMixTime = {};
            this.defaultMix = 0;
            if (skeletonData == null)
                throw new Error("skeletonData cannot be null.");
            this.skeletonData = skeletonData;
        }
        AnimationStateData.prototype.setMix = function (fromName, toName, duration) {
            var from = this.skeletonData.findAnimation(fromName);
            if (from == null)
                throw new Error("Animation not found: " + fromName);
            var to = this.skeletonData.findAnimation(toName);
            if (to == null)
                throw new Error("Animation not found: " + toName);
            this.setMixWith(from, to, duration);
        };
        AnimationStateData.prototype.setMixWith = function (from, to, duration) {
            if (from == null)
                throw new Error("from cannot be null.");
            if (to == null)
                throw new Error("to cannot be null.");
            var key = from.name + "." + to.name;
            this.animationToMixTime[key] = duration;
        };
        AnimationStateData.prototype.getMix = function (from, to) {
            var key = from.name + "." + to.name;
            var value = this.animationToMixTime[key];
            return value === undefined ? this.defaultMix : value;
        };
        return AnimationStateData;
    }());
    spine.AnimationStateData = AnimationStateData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var AtlasAttachmentLoader = (function () {
        function AtlasAttachmentLoader() {
        }
        AtlasAttachmentLoader.prototype.newRegionAttachment = function (skin, name, path, uid) {
            var flatName = name.replace(/\//g, "_");
            var spriteInfo = TGE.AssetManager.Get(flatName + "_" + uid);
            var spriteSheet = spriteInfo.spriteSheet;
            var drawWidth = typeof (spriteInfo.drawWidth) === "number" ? spriteInfo.drawWidth : spriteInfo.width;
            var drawHeight = typeof (spriteInfo.drawHeight) === "number" ? spriteInfo.drawHeight : spriteInfo.height;
            var region = new spine.TextureRegion();
            region.uid = uid;
            region.name = name;
            region.x = spriteInfo.x;
            region.y = spriteInfo.y;
            region.width = drawWidth;
            region.height = drawHeight;
            region.rotate = false;
            region.offsetX = typeof (spriteInfo.offsetX) === "number" ? spriteInfo.offsetX : 0;
            region.offsetY = typeof (spriteInfo.offsetY) === "number" ? spriteInfo.offsetY : 0;
            region.originalWidth = spriteInfo.width;
            region.originalHeight = spriteInfo.height;
            if (region == null)
                throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
            region.renderObject = region;
            var attachment = new spine.RegionAttachment(name);
            attachment.setRegion(region);
            return attachment;
        };
        AtlasAttachmentLoader.prototype.newBoundingBoxAttachment = function (skin, name) {
            return new spine.BoundingBoxAttachment(name);
        };
        AtlasAttachmentLoader.prototype.newPointAttachment = function (skin, name) {
            return new spine.PointAttachment(name);
        };
        return AtlasAttachmentLoader;
    }());
    spine.AtlasAttachmentLoader = AtlasAttachmentLoader;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Bone = (function () {
        function Bone(data, skeleton, parent) {
            this.children = new Array();
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.shearX = 0;
            this.shearY = 0;
            this.ax = 0;
            this.ay = 0;
            this.arotation = 0;
            this.ascaleX = 0;
            this.ascaleY = 0;
            this.ashearX = 0;
            this.ashearY = 0;
            this.appliedValid = false;
            this.a = 0;
            this.b = 0;
            this.worldX = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.sorted = false;
            this.active = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        Bone.prototype.isActive = function () {
            return this.active;
        };
        Bone.prototype.update = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        Bone.prototype.updateWorldTransform = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        Bone.prototype.updateWorldTransformWith = function (x, y, rotation, scaleX, scaleY, shearX, shearY) {
            this.ax = x;
            this.ay = y;
            this.arotation = rotation;
            this.ascaleX = scaleX;
            this.ascaleY = scaleY;
            this.ashearX = shearX;
            this.ashearY = shearY;
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                var skeleton = this.skeleton;
                var rotationY = rotation + 90 + shearY;
                var sx = skeleton.scaleX;
                var sy = skeleton.scaleY;
                this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
                this.b = spine.MathUtils.cosDeg(rotationY) * scaleY * sx;
                this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX * sy;
                this.d = spine.MathUtils.sinDeg(rotationY) * scaleY * sy;
                this.worldX = x * sx + skeleton.x;
                this.worldY = y * sy + skeleton.y;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.data.transformMode) {
                case spine.TransformMode.Normal: {
                    var rotationY = rotation + 90 + shearY;
                    var la = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case spine.TransformMode.OnlyTranslation: {
                    var rotationY = rotation + 90 + shearY;
                    this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    this.b = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    this.d = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    break;
                }
                case spine.TransformMode.NoRotationOrReflection: {
                    var s = pa * pa + pc * pc;
                    var prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * spine.MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * spine.MathUtils.radDeg;
                    }
                    var rx = rotation + shearX - prx;
                    var ry = rotation + shearY - prx + 90;
                    var la = spine.MathUtils.cosDeg(rx) * scaleX;
                    var lb = spine.MathUtils.cosDeg(ry) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rx) * scaleX;
                    var ld = spine.MathUtils.sinDeg(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case spine.TransformMode.NoScale:
                case spine.TransformMode.NoScaleOrReflection: {
                    var cos = spine.MathUtils.cosDeg(rotation);
                    var sin = spine.MathUtils.sinDeg(rotation);
                    var za = (pa * cos + pb * sin) / this.skeleton.scaleX;
                    var zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                    var s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    if (this.data.transformMode == spine.TransformMode.NoScale
                        && (pa * pd - pb * pc < 0) != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                        s = -s;
                    var r = Math.PI / 2 + Math.atan2(zc, za);
                    var zb = Math.cos(r) * s;
                    var zd = Math.sin(r) * s;
                    var la = spine.MathUtils.cosDeg(shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(90 + shearY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(90 + shearY) * scaleY;
                    this.a = za * la + zb * lc;
                    this.b = za * lb + zb * ld;
                    this.c = zc * la + zd * lc;
                    this.d = zc * lb + zd * ld;
                    break;
                }
            }
            this.a *= this.skeleton.scaleX;
            this.b *= this.skeleton.scaleX;
            this.c *= this.skeleton.scaleY;
            this.d *= this.skeleton.scaleY;
        };
        Bone.prototype.setToSetupPose = function () {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
            this.shearX = data.shearX;
            this.shearY = data.shearY;
        };
        Bone.prototype.getWorldRotationX = function () {
            return Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
        };
        Bone.prototype.getWorldRotationY = function () {
            return Math.atan2(this.d, this.b) * spine.MathUtils.radDeg;
        };
        Bone.prototype.getWorldScaleX = function () {
            return Math.sqrt(this.a * this.a + this.c * this.c);
        };
        Bone.prototype.getWorldScaleY = function () {
            return Math.sqrt(this.b * this.b + this.d * this.d);
        };
        Bone.prototype.updateAppliedTransform = function () {
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                this.ax = this.worldX;
                this.ay = this.worldY;
                this.arotation = Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * spine.MathUtils.radDeg;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            var pid = 1 / (pa * pd - pb * pc);
            var dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * pd * pid - dy * pb * pid);
            this.ay = (dy * pa * pid - dx * pc * pid);
            var ia = pid * pd;
            var id = pid * pa;
            var ib = pid * pb;
            var ic = pid * pc;
            var ra = ia * this.a - ib * this.c;
            var rb = ia * this.b - ib * this.d;
            var rc = id * this.c - ic * this.a;
            var rd = id * this.d - ic * this.b;
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                var det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = Math.atan2(ra * rb + rc * rd, det) * spine.MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * spine.MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * spine.MathUtils.radDeg;
            }
        };
        Bone.prototype.worldToLocal = function (world) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var invDet = 1 / (a * d - b * c);
            var x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = (x * d * invDet - y * b * invDet);
            world.y = (y * a * invDet - x * c * invDet);
            return world;
        };
        Bone.prototype.localToWorld = function (local) {
            var x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
        };
        Bone.prototype.worldToLocalRotation = function (worldRotation) {
            var sin = spine.MathUtils.sinDeg(worldRotation), cos = spine.MathUtils.cosDeg(worldRotation);
            return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * spine.MathUtils.radDeg + this.rotation - this.shearX;
        };
        Bone.prototype.localToWorldRotation = function (localRotation) {
            localRotation -= this.rotation - this.shearX;
            var sin = spine.MathUtils.sinDeg(localRotation), cos = spine.MathUtils.cosDeg(localRotation);
            return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * spine.MathUtils.radDeg;
        };
        Bone.prototype.rotateWorld = function (degrees) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var cos = spine.MathUtils.cosDeg(degrees), sin = spine.MathUtils.sinDeg(degrees);
            this.a = cos * a - sin * c;
            this.b = cos * b - sin * d;
            this.c = sin * a + cos * c;
            this.d = sin * b + cos * d;
            this.appliedValid = false;
        };
        return Bone;
    }());
    spine.Bone = Bone;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var BoneData = (function () {
        function BoneData(index, name, parent) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.shearX = 0;
            this.shearY = 0;
            this.transformMode = TransformMode.Normal;
            this.skinRequired = false;
            this.color = new spine.Alpha();
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            this.index = index;
            this.name = name;
            this.parent = parent;
        }
        return BoneData;
    }());
    spine.BoneData = BoneData;
    var TransformMode;
    (function (TransformMode) {
        TransformMode[TransformMode["Normal"] = 0] = "Normal";
        TransformMode[TransformMode["OnlyTranslation"] = 1] = "OnlyTranslation";
        TransformMode[TransformMode["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
        TransformMode[TransformMode["NoScale"] = 3] = "NoScale";
        TransformMode[TransformMode["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
    })(TransformMode = spine.TransformMode || (spine.TransformMode = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    var ConstraintData = (function () {
        function ConstraintData(name, order, skinRequired) {
            this.name = name;
            this.order = order;
            this.skinRequired = skinRequired;
        }
        return ConstraintData;
    }());
    spine.ConstraintData = ConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Event = (function () {
        function Event(time, data) {
            if (data == null)
                throw new Error("data cannot be null.");
            this.time = time;
            this.data = data;
        }
        return Event;
    }());
    spine.Event = Event;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var EventData = (function () {
        function EventData(name) {
            this.name = name;
        }
        return EventData;
    }());
    spine.EventData = EventData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var IkConstraint = (function () {
        function IkConstraint(data, skeleton) {
            this.bendDirection = 0;
            this.compress = false;
            this.stretch = false;
            this.mix = 1;
            this.softness = 0;
            this.active = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.mix = data.mix;
            this.softness = data.softness;
            this.bendDirection = data.bendDirection;
            this.compress = data.compress;
            this.stretch = data.stretch;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        IkConstraint.prototype.isActive = function () {
            return this.active;
        };
        IkConstraint.prototype.apply = function () {
            this.update();
        };
        IkConstraint.prototype.update = function () {
            var target = this.target;
            var bones = this.bones;
            switch (bones.length) {
                case 1:
                    this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
                    break;
                case 2:
                    this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.softness, this.mix);
                    break;
            }
        };
        IkConstraint.prototype.apply1 = function (bone, targetX, targetY, compress, stretch, uniform, alpha) {
            if (!bone.appliedValid)
                bone.updateAppliedTransform();
            var p = bone.parent;
            var id = 1 / (p.a * p.d - p.b * p.c);
            var x = targetX - p.worldX, y = targetY - p.worldY;
            var tx = (x * p.d - y * p.b) * id - bone.ax, ty = (y * p.a - x * p.c) * id - bone.ay;
            var rotationIK = Math.atan2(ty, tx) * spine.MathUtils.radDeg - bone.ashearX - bone.arotation;
            if (bone.ascaleX < 0)
                rotationIK += 180;
            if (rotationIK > 180)
                rotationIK -= 360;
            else if (rotationIK < -180)
                rotationIK += 360;
            var sx = bone.ascaleX, sy = bone.ascaleY;
            if (compress || stretch) {
                var b = bone.data.length * sx, dd = Math.sqrt(tx * tx + ty * ty);
                if ((compress && dd < b) || (stretch && dd > b) && b > 0.0001) {
                    var s = (dd / b - 1) * alpha + 1;
                    sx *= s;
                    if (uniform)
                        sy *= s;
                }
            }
            bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
        };
        IkConstraint.prototype.apply2 = function (parent, child, targetX, targetY, bendDir, stretch, softness, alpha) {
            if (alpha == 0) {
                child.updateWorldTransform();
                return;
            }
            if (!parent.appliedValid)
                parent.updateAppliedTransform();
            if (!child.appliedValid)
                child.updateAppliedTransform();
            var px = parent.ax, py = parent.ay, psx = parent.ascaleX, sx = psx, psy = parent.ascaleY, csx = child.ascaleX;
            var os1 = 0, os2 = 0, s2 = 0;
            if (psx < 0) {
                psx = -psx;
                os1 = 180;
                s2 = -1;
            }
            else {
                os1 = 0;
                s2 = 1;
            }
            if (psy < 0) {
                psy = -psy;
                s2 = -s2;
            }
            if (csx < 0) {
                csx = -csx;
                os2 = 180;
            }
            else
                os2 = 0;
            var cx = child.ax, cy = 0, cwx = 0, cwy = 0, a = parent.a, b = parent.b, c = parent.c, d = parent.d;
            var u = Math.abs(psx - psy) <= 0.0001;
            if (!u) {
                cy = 0;
                cwx = a * cx + parent.worldX;
                cwy = c * cx + parent.worldY;
            }
            else {
                cy = child.ay;
                cwx = a * cx + b * cy + parent.worldX;
                cwy = c * cx + d * cy + parent.worldY;
            }
            var pp = parent.parent;
            a = pp.a;
            b = pp.b;
            c = pp.c;
            d = pp.d;
            var id = 1 / (a * d - b * c), x = cwx - pp.worldX, y = cwy - pp.worldY;
            var dx = (x * d - y * b) * id - px, dy = (y * a - x * c) * id - py;
            var l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.data.length * csx, a1, a2;
            if (l1 < 0.0001) {
                this.apply1(parent, targetX, targetY, false, stretch, false, alpha);
                child.updateWorldTransformWith(cx, cy, 0, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
                return;
            }
            x = targetX - pp.worldX;
            y = targetY - pp.worldY;
            var tx = (x * d - y * b) * id - px, ty = (y * a - x * c) * id - py;
            var dd = tx * tx + ty * ty;
            if (softness != 0) {
                softness *= psx * (csx + 1) / 2;
                var td = Math.sqrt(dd), sd = td - l1 - l2 * psx + softness;
                if (sd > 0) {
                    var p = Math.min(1, sd / (softness * 2)) - 1;
                    p = (sd - softness * (1 - p * p)) / td;
                    tx -= p * tx;
                    ty -= p * ty;
                    dd = tx * tx + ty * ty;
                }
            }
            outer: if (u) {
                l2 *= psx;
                var cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                if (cos < -1)
                    cos = -1;
                else if (cos > 1) {
                    cos = 1;
                    if (stretch)
                        sx *= (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
                }
                a2 = Math.acos(cos) * bendDir;
                a = l1 + l2 * cos;
                b = l2 * Math.sin(a2);
                a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
            }
            else {
                a = psx * l2;
                b = psy * l2;
                var aa = a * a, bb = b * b, ta = Math.atan2(ty, tx);
                c = bb * l1 * l1 + aa * dd - aa * bb;
                var c1 = -2 * bb * l1, c2 = bb - aa;
                d = c1 * c1 - 4 * c2 * c;
                if (d >= 0) {
                    var q = Math.sqrt(d);
                    if (c1 < 0)
                        q = -q;
                    q = -(c1 + q) / 2;
                    var r0 = q / c2, r1 = c / q;
                    var r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                    if (r * r <= dd) {
                        y = Math.sqrt(dd - r * r) * bendDir;
                        a1 = ta - Math.atan2(y, r);
                        a2 = Math.atan2(y / psy, (r - l1) / psx);
                        break outer;
                    }
                }
                var minAngle = spine.MathUtils.PI, minX = l1 - a, minDist = minX * minX, minY = 0;
                var maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
                c = -a * l1 / (aa - bb);
                if (c >= -1 && c <= 1) {
                    c = Math.acos(c);
                    x = a * Math.cos(c) + l1;
                    y = b * Math.sin(c);
                    d = x * x + y * y;
                    if (d < minDist) {
                        minAngle = c;
                        minDist = d;
                        minX = x;
                        minY = y;
                    }
                    if (d > maxDist) {
                        maxAngle = c;
                        maxDist = d;
                        maxX = x;
                        maxY = y;
                    }
                }
                if (dd <= (minDist + maxDist) / 2) {
                    a1 = ta - Math.atan2(minY * bendDir, minX);
                    a2 = minAngle * bendDir;
                }
                else {
                    a1 = ta - Math.atan2(maxY * bendDir, maxX);
                    a2 = maxAngle * bendDir;
                }
            }
            var os = Math.atan2(cy, cx) * s2;
            var rotation = parent.arotation;
            a1 = (a1 - os) * spine.MathUtils.radDeg + os1 - rotation;
            if (a1 > 180)
                a1 -= 360;
            else if (a1 < -180)
                a1 += 360;
            parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, parent.ascaleY, 0, 0);
            rotation = child.arotation;
            a2 = ((a2 + os) * spine.MathUtils.radDeg - child.ashearX) * s2 + os2 - rotation;
            if (a2 > 180)
                a2 -= 360;
            else if (a2 < -180)
                a2 += 360;
            child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
        };
        return IkConstraint;
    }());
    spine.IkConstraint = IkConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var IkConstraintData = (function (_super) {
        __extends(IkConstraintData, _super);
        function IkConstraintData(name) {
            var _this = _super.call(this, name, 0, false) || this;
            _this.bones = new Array();
            _this.bendDirection = 1;
            _this.compress = false;
            _this.stretch = false;
            _this.uniform = false;
            _this.mix = 1;
            _this.softness = 0;
            return _this;
        }
        return IkConstraintData;
    }(spine.ConstraintData));
    spine.IkConstraintData = IkConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Skeleton = (function () {
        function Skeleton(data) {
            this._updateCache = new Array();
            this.updateCacheReset = new Array();
            this.time = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.x = 0;
            this.y = 0;
            if (data == null)
                throw new Error("data cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++) {
                var boneData = data.bones[i];
                var bone = void 0;
                if (boneData.parent == null)
                    bone = new spine.Bone(boneData, this, null);
                else {
                    var parent_1 = this.bones[boneData.parent.index];
                    bone = new spine.Bone(boneData, this, parent_1);
                    parent_1.children.push(bone);
                }
                this.bones.push(bone);
            }
            this.slots = new Array();
            this.drawOrder = new Array();
            for (var i = 0; i < data.slots.length; i++) {
                var slotData = data.slots[i];
                var bone = this.bones[slotData.boneData.index];
                var slot = new spine.Slot(slotData, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
            this.ikConstraints = new Array();
            for (var i = 0; i < data.ikConstraints.length; i++) {
                var ikConstraintData = data.ikConstraints[i];
                this.ikConstraints.push(new spine.IkConstraint(ikConstraintData, this));
            }
            this.color = new spine.Alpha(1);
            this.updateCache();
        }
        Skeleton.prototype.updateCache = function () {
            var updateCache = this._updateCache;
            updateCache.length = 0;
            this.updateCacheReset.length = 0;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                bone.sorted = bone.data.skinRequired;
                bone.active = !bone.sorted;
            }
            if (this.skin != null) {
                var skinBones = this.skin.bones;
                for (var i = 0, n = this.skin.bones.length; i < n; i++) {
                    var bone = this.bones[skinBones[i].index];
                    do {
                        bone.sorted = false;
                        bone.active = true;
                        bone = bone.parent;
                    } while (bone != null);
                }
            }
            var ikConstraints = this.ikConstraints;
            var ikCount = ikConstraints.length;
            var constraintCount = ikCount;
            outer: for (var i = 0; i < constraintCount; i++) {
                for (var ii = 0; ii < ikCount; ii++) {
                    var constraint = ikConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortIkConstraint(constraint);
                        continue outer;
                    }
                }
            }
            for (var i = 0, n = bones.length; i < n; i++)
                this.sortBone(bones[i]);
        };
        Skeleton.prototype.sortIkConstraint = function (constraint) {
            constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || (this.skin != null && spine.Utils.contains(this.skin.constraints, constraint.data, true)));
            if (!constraint.active)
                return;
            var target = constraint.target;
            this.sortBone(target);
            var constrained = constraint.bones;
            var parent = constrained[0];
            this.sortBone(parent);
            if (constrained.length > 1) {
                var child = constrained[constrained.length - 1];
                if (!(this._updateCache.indexOf(child) > -1))
                    this.updateCacheReset.push(child);
            }
            this._updateCache.push(constraint);
            this.sortReset(parent.children);
            constrained[constrained.length - 1].sorted = true;
        };
        Skeleton.prototype.sortBone = function (bone) {
            if (bone.sorted)
                return;
            var parent = bone.parent;
            if (parent != null)
                this.sortBone(parent);
            bone.sorted = true;
            this._updateCache.push(bone);
        };
        Skeleton.prototype.sortReset = function (bones) {
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (!bone.active)
                    continue;
                if (bone.sorted)
                    this.sortReset(bone.children);
                bone.sorted = false;
            }
        };
        Skeleton.prototype.updateWorldTransform = function () {
            var updateCacheReset = this.updateCacheReset;
            for (var i = 0, n = updateCacheReset.length; i < n; i++) {
                var bone = updateCacheReset[i];
                bone.ax = bone.x;
                bone.ay = bone.y;
                bone.arotation = bone.rotation;
                bone.ascaleX = bone.scaleX;
                bone.ascaleY = bone.scaleY;
                bone.ashearX = bone.shearX;
                bone.ashearY = bone.shearY;
                bone.appliedValid = true;
            }
            var updateCache = this._updateCache;
            for (var i = 0, n = updateCache.length; i < n; i++)
                updateCache[i].update();
        };
        Skeleton.prototype.setToSetupPose = function () {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        };
        Skeleton.prototype.setBonesToSetupPose = function () {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                constraint.mix = constraint.data.mix;
                constraint.softness = constraint.data.softness;
                constraint.bendDirection = constraint.data.bendDirection;
                constraint.compress = constraint.data.compress;
                constraint.stretch = constraint.data.stretch;
            }
        };
        Skeleton.prototype.setSlotsToSetupPose = function () {
            var slots = this.slots;
            spine.Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
            for (var i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();
        };
        Skeleton.prototype.getRootBone = function () {
            if (this.bones.length == 0)
                return null;
            return this.bones[0];
        };
        Skeleton.prototype.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.data.name == boneName)
                    return bone;
            }
            return null;
        };
        Skeleton.prototype.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return i;
            return -1;
        };
        Skeleton.prototype.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName)
                    return slot;
            }
            return null;
        };
        Skeleton.prototype.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return i;
            return -1;
        };
        Skeleton.prototype.setSkinByName = function (skinName) {
            var skin = this.data.findSkin(skinName);
            if (skin == null)
                throw new Error("Skin not found: " + skinName);
            this.setSkin(skin);
        };
        Skeleton.prototype.setSkin = function (newSkin) {
            if (newSkin == this.skin)
                return;
            if (newSkin != null) {
                if (this.skin != null)
                    newSkin.attachAll(this, this.skin);
                else {
                    var slots = this.slots;
                    for (var i = 0, n = slots.length; i < n; i++) {
                        var slot = slots[i];
                        var name_1 = slot.data.attachmentName;
                        if (name_1 != null) {
                            var attachment = newSkin.getAttachment(i, name_1);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                        }
                    }
                }
            }
            this.skin = newSkin;
            this.updateCache();
        };
        Skeleton.prototype.getAttachmentByName = function (slotName, attachmentName) {
            return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
        };
        Skeleton.prototype.getAttachment = function (slotIndex, attachmentName) {
            if (attachmentName == null)
                throw new Error("attachmentName cannot be null.");
            if (this.skin != null) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment != null)
                    return attachment;
            }
            if (this.data.defaultSkin != null)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        };
        Skeleton.prototype.setAttachment = function (slotName, attachmentName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName != null) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (attachment == null)
                            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw new Error("Slot not found: " + slotName);
        };
        Skeleton.prototype.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var ikConstraint = ikConstraints[i];
                if (ikConstraint.data.name == constraintName)
                    return ikConstraint;
            }
            return null;
        };
        Skeleton.prototype.getBounds = function (offset, size, temp) {
            if (temp === void 0) { temp = new Array(2); }
            if (offset == null)
                throw new Error("offset cannot be null.");
            if (size == null)
                throw new Error("size cannot be null.");
            var drawOrder = this.drawOrder;
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (var i = 0, n = drawOrder.length; i < n; i++) {
                var slot = drawOrder[i];
                if (!slot.bone.active)
                    continue;
                var verticesLength = 0;
                var vertices = null;
                var attachment = slot.getAttachment();
                if (attachment instanceof spine.RegionAttachment) {
                    verticesLength = 8;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
                }
                if (vertices != null) {
                    for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        var x = vertices[ii], y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            offset.set(minX, minY);
            size.set(maxX - minX, maxY - minY);
        };
        Skeleton.prototype.update = function (delta) {
            this.time += delta;
        };
        return Skeleton;
    }());
    spine.Skeleton = Skeleton;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkeletonBounds = (function () {
        function SkeletonBounds() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.boundingBoxes = new Array();
            this.polygons = new Array();
            this.polygonPool = new spine.Pool(function () {
                return spine.Utils.newFloatArray(16);
            });
        }
        SkeletonBounds.prototype.update = function (skeleton, updateAabb) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            var boundingBoxes = this.boundingBoxes;
            var polygons = this.polygons;
            var polygonPool = this.polygonPool;
            var slots = skeleton.slots;
            var slotCount = slots.length;
            boundingBoxes.length = 0;
            polygonPool.freeAll(polygons);
            polygons.length = 0;
            for (var i = 0; i < slotCount; i++) {
                var slot = slots[i];
                if (!slot.bone.active)
                    continue;
                var attachment = slot.getAttachment();
                if (attachment instanceof spine.BoundingBoxAttachment) {
                    var boundingBox = attachment;
                    boundingBoxes.push(boundingBox);
                    var polygon = polygonPool.obtain();
                    if (polygon.length != boundingBox.worldVerticesLength) {
                        polygon = spine.Utils.newFloatArray(boundingBox.worldVerticesLength);
                    }
                    polygons.push(polygon);
                    boundingBox.computeWorldVertices(slot, 0, boundingBox.worldVerticesLength, polygon, 0, 2);
                }
            }
            if (updateAabb) {
                this.aabbCompute();
            }
            else {
                this.minX = Number.POSITIVE_INFINITY;
                this.minY = Number.POSITIVE_INFINITY;
                this.maxX = Number.NEGATIVE_INFINITY;
                this.maxY = Number.NEGATIVE_INFINITY;
            }
        };
        SkeletonBounds.prototype.aabbCompute = function () {
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            var polygons = this.polygons;
            for (var i = 0, n = polygons.length; i < n; i++) {
                var polygon = polygons[i];
                var vertices = polygon;
                for (var ii = 0, nn = polygon.length; ii < nn; ii += 2) {
                    var x = vertices[ii];
                    var y = vertices[ii + 1];
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        };
        SkeletonBounds.prototype.getPolygon = function (boundingBox) {
            if (boundingBox == null)
                throw new Error("boundingBox cannot be null.");
            var index = this.boundingBoxes.indexOf(boundingBox);
            return index == -1 ? null : this.polygons[index];
        };
        SkeletonBounds.prototype.getWidth = function () {
            return this.maxX - this.minX;
        };
        SkeletonBounds.prototype.getHeight = function () {
            return this.maxY - this.minY;
        };
        return SkeletonBounds;
    }());
    spine.SkeletonBounds = SkeletonBounds;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkeletonData = (function () {
        function SkeletonData() {
            this.bones = new Array();
            this.slots = new Array();
            this.skins = new Array();
            this.events = new Array();
            this.animations = new Array();
            this.ikConstraints = new Array();
            this.fps = 0;
        }
        SkeletonData.prototype.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.name == boneName)
                    return bone;
            }
            return null;
        };
        SkeletonData.prototype.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return i;
            return -1;
        };
        SkeletonData.prototype.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.name == slotName)
                    return slot;
            }
            return null;
        };
        SkeletonData.prototype.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName)
                    return i;
            return -1;
        };
        SkeletonData.prototype.findSkin = function (skinName) {
            if (skinName == null)
                throw new Error("skinName cannot be null.");
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++) {
                var skin = skins[i];
                if (skin.name == skinName)
                    return skin;
            }
            return null;
        };
        SkeletonData.prototype.findEvent = function (eventDataName) {
            if (eventDataName == null)
                throw new Error("eventDataName cannot be null.");
            var events = this.events;
            for (var i = 0, n = events.length; i < n; i++) {
                var event_4 = events[i];
                if (event_4.name == eventDataName)
                    return event_4;
            }
            return null;
        };
        SkeletonData.prototype.findAnimation = function (animationName) {
            if (animationName == null)
                throw new Error("animationName cannot be null.");
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++) {
                var animation = animations[i];
                if (animation.name == animationName)
                    return animation;
            }
            return null;
        };
        SkeletonData.prototype.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        return SkeletonData;
    }());
    spine.SkeletonData = SkeletonData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkeletonJson = (function () {
        function SkeletonJson(attachmentLoader) {
            this.scale = 1;
            this.attachmentLoader = attachmentLoader;
        }
        SkeletonJson.prototype.readSkeletonData = function (json, uid) {
            var scale = this.scale;
            var skeletonData = new spine.SkeletonData();
            var root = typeof (json) === "string" ? JSON.parse(json) : json;
            var skeletonMap = root.skeleton;
            if (skeletonMap != null) {
                skeletonData.hash = skeletonMap.hash;
                skeletonData.version = skeletonMap.spine;
                skeletonData.x = skeletonMap.x;
                skeletonData.y = skeletonMap.y;
                skeletonData.width = skeletonMap.width;
                skeletonData.height = skeletonMap.height;
                skeletonData.fps = skeletonMap.fps;
                skeletonData.imagesPath = skeletonMap.images;
            }
            if (root.bones) {
                for (var i = 0; i < root.bones.length; i++) {
                    var boneMap = root.bones[i];
                    var parent_2 = null;
                    var parentName = this.getValue(boneMap, "parent", null);
                    if (parentName != null) {
                        parent_2 = skeletonData.findBone(parentName);
                        if (parent_2 == null)
                            throw new Error("Parent bone not found: " + parentName);
                    }
                    var data = new spine.BoneData(skeletonData.bones.length, boneMap.name, parent_2);
                    data.length = this.getValue(boneMap, "length", 0) * scale;
                    data.x = this.getValue(boneMap, "x", 0) * scale;
                    data.y = this.getValue(boneMap, "y", 0) * scale;
                    data.rotation = this.getValue(boneMap, "rotation", 0);
                    data.scaleX = this.getValue(boneMap, "scaleX", 1);
                    data.scaleY = this.getValue(boneMap, "scaleY", 1);
                    data.shearX = this.getValue(boneMap, "shearX", 0);
                    data.shearY = this.getValue(boneMap, "shearY", 0);
                    data.transformMode = SkeletonJson.transformModeFromString(this.getValue(boneMap, "transform", "normal"));
                    data.skinRequired = this.getValue(boneMap, "skin", false);
                    skeletonData.bones.push(data);
                }
            }
            if (root.slots) {
                for (var i = 0; i < root.slots.length; i++) {
                    var slotMap = root.slots[i];
                    var slotName = slotMap.name;
                    var boneName = slotMap.bone;
                    var boneData = skeletonData.findBone(boneName);
                    if (boneData == null)
                        throw new Error("Slot bone not found: " + boneName);
                    var data = new spine.SlotData(skeletonData.slots.length, slotName, boneData);
                    var color = this.getValue(slotMap, "color", null);
                    if (color != null)
                        data.color.setFromString(color);
                    var dark = this.getValue(slotMap, "dark", null);
                    if (dark != null) {
                        data.darkColor = new spine.Alpha(1);
                        data.darkColor.setFromString(dark);
                    }
                    data.attachmentName = this.getValue(slotMap, "attachment", null);
                    skeletonData.slots.push(data);
                }
            }
            if (root.ik) {
                for (var i = 0; i < root.ik.length; i++) {
                    var constraintMap = root.ik[i];
                    var data = new spine.IkConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    data.skinRequired = this.getValue(constraintMap, "skin", false);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("IK bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("IK target bone not found: " + targetName);
                    data.mix = this.getValue(constraintMap, "mix", 1);
                    data.softness = this.getValue(constraintMap, "softness", 0) * scale;
                    data.bendDirection = this.getValue(constraintMap, "bendPositive", true) ? 1 : -1;
                    data.compress = this.getValue(constraintMap, "compress", false);
                    data.stretch = this.getValue(constraintMap, "stretch", false);
                    data.uniform = this.getValue(constraintMap, "uniform", false);
                    skeletonData.ikConstraints.push(data);
                }
            }
            if (root.skins) {
                for (var i = 0; i < root.skins.length; i++) {
                    var skinMap = root.skins[i];
                    var skin = new spine.Skin(skinMap.name);
                    if (skinMap.bones) {
                        for (var ii = 0; ii < skinMap.bones.length; ii++) {
                            var bone = skeletonData.findBone(skinMap.bones[ii]);
                            if (bone == null)
                                throw new Error("Skin bone not found: " + skinMap.bones[i]);
                            skin.bones.push(bone);
                        }
                    }
                    if (skinMap.ik) {
                        for (var ii = 0; ii < skinMap.ik.length; ii++) {
                            var constraint = skeletonData.findIkConstraint(skinMap.ik[ii]);
                            if (constraint == null)
                                throw new Error("Skin IK constraint not found: " + skinMap.ik[i]);
                            skin.constraints.push(constraint);
                        }
                    }
                    for (var slotName in skinMap.attachments) {
                        var slot = skeletonData.findSlot(slotName);
                        if (slot == null)
                            throw new Error("Slot not found: " + slotName);
                        var slotMap = skinMap.attachments[slotName];
                        for (var entryName in slotMap) {
                            var attachment = this.readAttachment(slotMap[entryName], skin, slot.index, entryName, skeletonData, uid);
                            if (attachment != null)
                                skin.setAttachment(slot.index, entryName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
            }
            if (root.events) {
                for (var eventName in root.events) {
                    var eventMap = root.events[eventName];
                    var data = new spine.EventData(eventName);
                    data.intValue = this.getValue(eventMap, "int", 0);
                    data.floatValue = this.getValue(eventMap, "float", 0);
                    data.stringValue = this.getValue(eventMap, "string", "");
                    data.audioPath = this.getValue(eventMap, "audio", null);
                    if (data.audioPath != null) {
                        data.volume = this.getValue(eventMap, "volume", 1);
                        data.balance = this.getValue(eventMap, "balance", 0);
                    }
                    skeletonData.events.push(data);
                }
            }
            if (root.animations) {
                for (var animationName in root.animations) {
                    var animationMap = root.animations[animationName];
                    this.readAnimation(animationMap, animationName, skeletonData);
                }
            }
            return skeletonData;
        };
        SkeletonJson.prototype.readAttachment = function (map, skin, slotIndex, name, skeletonData, uid) {
            var scale = this.scale;
            name = this.getValue(map, "name", name);
            var type = this.getValue(map, "type", "region");
            switch (type) {
                case "region": {
                    var path = this.getValue(map, "path", name);
                    var region = this.attachmentLoader.newRegionAttachment(skin, name, path, uid);
                    if (region == null)
                        return null;
                    region.path = path;
                    region.x = this.getValue(map, "x", 0) * scale;
                    region.y = this.getValue(map, "y", 0) * scale;
                    region.scaleX = this.getValue(map, "scaleX", 1);
                    region.scaleY = this.getValue(map, "scaleY", 1);
                    region.rotation = this.getValue(map, "rotation", 0);
                    region.width = map.width * scale;
                    region.height = map.height * scale;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        region.color.setFromString(color);
                    region.updateOffset();
                    return region;
                }
                case "boundingbox": {
                    var box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (box == null)
                        return null;
                    this.readVertices(map, box, map.vertexCount << 1);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        box.color.setFromString(color);
                    return box;
                }
                case "point": {
                    var point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (point == null)
                        return null;
                    point.x = this.getValue(map, "x", 0) * scale;
                    point.y = this.getValue(map, "y", 0) * scale;
                    point.rotation = this.getValue(map, "rotation", 0);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        point.color.setFromString(color);
                    return point;
                }
            }
            return null;
        };
        SkeletonJson.prototype.readVertices = function (map, attachment, verticesLength) {
            var scale = this.scale;
            attachment.worldVerticesLength = verticesLength;
            var vertices = map.vertices;
            if (verticesLength == vertices.length) {
                var scaledVertices = spine.Utils.toFloatArray(vertices);
                if (scale != 1) {
                    for (var i = 0, n = vertices.length; i < n; i++)
                        scaledVertices[i] *= scale;
                }
                attachment.vertices = scaledVertices;
                return;
            }
            var weights = new Array();
            var bones = new Array();
            for (var i = 0, n = vertices.length; i < n;) {
                var boneCount = vertices[i++];
                bones.push(boneCount);
                for (var nn = i + boneCount * 4; i < nn; i += 4) {
                    bones.push(vertices[i]);
                    weights.push(vertices[i + 1] * scale);
                    weights.push(vertices[i + 2] * scale);
                    weights.push(vertices[i + 3]);
                }
            }
            attachment.bones = bones;
            attachment.vertices = spine.Utils.toFloatArray(weights);
        };
        SkeletonJson.prototype.readAnimation = function (map, name, skeletonData) {
            var scale = this.scale;
            var timelines = new Array();
            var duration = 0;
            if (map.slots) {
                for (var slotName in map.slots) {
                    var slotMap = map.slots[slotName];
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    if (slotIndex == -1)
                        throw new Error("Slot not found: " + slotName);
                    for (var timelineName in slotMap) {
                        var timelineMap = slotMap[timelineName];
                        if (timelineName == "attachment") {
                            var timeline = new spine.AttachmentTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex++, this.getValue(valueMap, "time", 0), valueMap.name);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                        else if (timelineName == "color") {
                            var timeline = new spine.ColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var color = new spine.Alpha();
                                color.setFromString(valueMap.color);
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), color.a);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.ColorTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")");
                    }
                }
            }
            if (map.bones) {
                for (var boneName in map.bones) {
                    var boneMap = map.bones[boneName];
                    var boneIndex = skeletonData.findBoneIndex(boneName);
                    if (boneIndex == -1)
                        throw new Error("Bone not found: " + boneName);
                    for (var timelineName in boneMap) {
                        var timelineMap = boneMap[timelineName];
                        if (timelineName === "rotate") {
                            var timeline = new spine.RotateTimeline(timelineMap.length);
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "angle", 0));
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.RotateTimeline.ENTRIES]);
                        }
                        else if (timelineName === "translate" || timelineName === "scale" || timelineName === "shear") {
                            var timeline = null;
                            var timelineScale = 1, defaultValue = 0;
                            if (timelineName === "scale") {
                                timeline = new spine.ScaleTimeline(timelineMap.length);
                                defaultValue = 1;
                            }
                            else if (timelineName === "shear")
                                timeline = new spine.ShearTimeline(timelineMap.length);
                            else {
                                timeline = new spine.TranslateTimeline(timelineMap.length);
                                timelineScale = scale;
                            }
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var x = this.getValue(valueMap, "x", defaultValue), y = this.getValue(valueMap, "y", defaultValue);
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), x * timelineScale, y * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TranslateTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")");
                    }
                }
            }
            if (map.ik) {
                for (var constraintName in map.ik) {
                    var constraintMap = map.ik[constraintName];
                    var constraint = skeletonData.findIkConstraint(constraintName);
                    var timeline = new spine.IkConstraintTimeline(constraintMap.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    var frameIndex = 0;
                    for (var i = 0; i < constraintMap.length; i++) {
                        var valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "mix", 1), this.getValue(valueMap, "softness", 0) * scale, this.getValue(valueMap, "bendPositive", true) ? 1 : -1, this.getValue(valueMap, "compress", false), this.getValue(valueMap, "stretch", false));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.IkConstraintTimeline.ENTRIES]);
                }
            }
            var drawOrderNode = map.drawOrder;
            if (drawOrderNode == null)
                drawOrderNode = map.draworder;
            if (drawOrderNode != null) {
                var timeline = new spine.DrawOrderTimeline(drawOrderNode.length);
                var slotCount = skeletonData.slots.length;
                var frameIndex = 0;
                for (var j = 0; j < drawOrderNode.length; j++) {
                    var drawOrderMap = drawOrderNode[j];
                    var drawOrder = null;
                    var offsets = this.getValue(drawOrderMap, "offsets", null);
                    if (offsets != null) {
                        drawOrder = spine.Utils.newArray(slotCount, -1);
                        var unchanged = spine.Utils.newArray(slotCount - offsets.length, 0);
                        var originalIndex = 0, unchangedIndex = 0;
                        for (var i = 0; i < offsets.length; i++) {
                            var offsetMap = offsets[i];
                            var slotIndex = skeletonData.findSlotIndex(offsetMap.slot);
                            if (slotIndex == -1)
                                throw new Error("Slot not found: " + offsetMap.slot);
                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;
                            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                        }
                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;
                        for (var i = slotCount - 1; i >= 0; i--)
                            if (drawOrder[i] == -1)
                                drawOrder[i] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frameIndex++, this.getValue(drawOrderMap, "time", 0), drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (map.events) {
                var timeline = new spine.EventTimeline(map.events.length);
                var frameIndex = 0;
                for (var i = 0; i < map.events.length; i++) {
                    var eventMap = map.events[i];
                    var eventData = skeletonData.findEvent(eventMap.name);
                    if (eventData == null)
                        throw new Error("Event not found: " + eventMap.name);
                    var event_5 = new spine.Event(spine.Utils.toSinglePrecision(this.getValue(eventMap, "time", 0)), eventData);
                    event_5.intValue = this.getValue(eventMap, "int", eventData.intValue);
                    event_5.floatValue = this.getValue(eventMap, "float", eventData.floatValue);
                    event_5.stringValue = this.getValue(eventMap, "string", eventData.stringValue);
                    if (event_5.data.audioPath != null) {
                        event_5.volume = this.getValue(eventMap, "volume", 1);
                        event_5.balance = this.getValue(eventMap, "balance", 0);
                    }
                    timeline.setFrame(frameIndex++, event_5);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (isNaN(duration)) {
                throw new Error("Error while parsing animation, duration is NaN");
            }
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        };
        SkeletonJson.prototype.readCurve = function (map, timeline, frameIndex) {
            if (!map.curve)
                return;
            if (map.curve == "stepped")
                timeline.setStepped(frameIndex);
            else {
                var curve = map.curve;
                timeline.setCurve(frameIndex, curve, this.getValue(map, "c2", 0), this.getValue(map, "c3", 1), this.getValue(map, "c4", 1));
            }
        };
        SkeletonJson.prototype.getValue = function (map, prop, defaultValue) {
            return map[prop] !== undefined ? map[prop] : defaultValue;
        };
        SkeletonJson.transformModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.TransformMode.Normal;
            if (str == "onlytranslation")
                return spine.TransformMode.OnlyTranslation;
            if (str == "norotationorreflection")
                return spine.TransformMode.NoRotationOrReflection;
            if (str == "noscale")
                return spine.TransformMode.NoScale;
            if (str == "noscaleorreflection")
                return spine.TransformMode.NoScaleOrReflection;
            throw new Error("Unknown transform mode: " + str);
        };
        return SkeletonJson;
    }());
    spine.SkeletonJson = SkeletonJson;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkinEntry = (function () {
        function SkinEntry(slotIndex, name, attachment) {
            this.slotIndex = slotIndex;
            this.name = name;
            this.attachment = attachment;
        }
        return SkinEntry;
    }());
    spine.SkinEntry = SkinEntry;
    var Skin = (function () {
        function Skin(name) {
            this.attachments = new Array();
            this.bones = Array();
            this.constraints = new Array();
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        Skin.prototype.setAttachment = function (slotIndex, name, attachment) {
            if (attachment == null)
                throw new Error("attachment cannot be null.");
            var attachments = this.attachments;
            if (slotIndex >= attachments.length)
                attachments.length = slotIndex + 1;
            if (!attachments[slotIndex])
                attachments[slotIndex] = {};
            attachments[slotIndex][name] = attachment;
        };
        Skin.prototype.addSkin = function (skin) {
            for (var i = 0; i < skin.bones.length; i++) {
                var bone = skin.bones[i];
                var contained = false;
                for (var j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (var i = 0; i < skin.constraints.length; i++) {
                var constraint = skin.constraints[i];
                var contained = false;
                for (var j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            var attachments = skin.getAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
            }
        };
        Skin.prototype.copySkin = function (skin) {
            for (var i = 0; i < skin.bones.length; i++) {
                var bone = skin.bones[i];
                var contained = false;
                for (var j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (var i = 0; i < skin.constraints.length; i++) {
                var constraint = skin.constraints[i];
                var contained = false;
                for (var j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            var attachments = skin.getAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                if (attachment.attachment == null)
                    continue;
                {
                    attachment.attachment = attachment.attachment.copy();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
            }
        };
        Skin.prototype.getAttachment = function (slotIndex, name) {
            var dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
        };
        Skin.prototype.removeAttachment = function (slotIndex, name) {
            var dictionary = this.attachments[slotIndex];
            if (dictionary)
                dictionary[name] = null;
        };
        Skin.prototype.getAttachments = function () {
            var entries = new Array();
            for (var i = 0; i < this.attachments.length; i++) {
                var slotAttachments = this.attachments[i];
                if (slotAttachments) {
                    for (var name_2 in slotAttachments) {
                        var attachment = slotAttachments[name_2];
                        if (attachment)
                            entries.push(new SkinEntry(i, name_2, attachment));
                    }
                }
            }
            return entries;
        };
        Skin.prototype.getAttachmentsForSlot = function (slotIndex, attachments) {
            var slotAttachments = this.attachments[slotIndex];
            if (slotAttachments) {
                for (var name_3 in slotAttachments) {
                    var attachment = slotAttachments[name_3];
                    if (attachment)
                        attachments.push(new SkinEntry(slotIndex, name_3, attachment));
                }
            }
        };
        Skin.prototype.clear = function () {
            this.attachments.length = 0;
            this.bones.length = 0;
            this.constraints.length = 0;
        };
        Skin.prototype.attachAll = function (skeleton, oldSkin) {
            var slotIndex = 0;
            for (var i = 0; i < skeleton.slots.length; i++) {
                var slot = skeleton.slots[i];
                var slotAttachment = slot.getAttachment();
                if (slotAttachment && slotIndex < oldSkin.attachments.length) {
                    var dictionary = oldSkin.attachments[slotIndex];
                    for (var key in dictionary) {
                        var skinAttachment = dictionary[key];
                        if (slotAttachment == skinAttachment) {
                            var attachment = this.getAttachment(slotIndex, key);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                            break;
                        }
                    }
                }
                slotIndex++;
            }
        };
        return Skin;
    }());
    spine.Skin = Skin;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Slot = (function () {
        function Slot(data, bone) {
            this.deform = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (bone == null)
                throw new Error("bone cannot be null.");
            this.data = data;
            this.bone = bone;
            this.color = new spine.Alpha();
            this.darkColor = data.darkColor == null ? null : new spine.Alpha();
            this.setToSetupPose();
        }
        Slot.prototype.getAttachment = function () {
            return this.attachment;
        };
        Slot.prototype.setAttachment = function (attachment) {
            if (this.attachment == attachment)
                return;
            this.attachment = attachment;
            this.attachmentTime = this.bone.skeleton.time;
            this.deform.length = 0;
        };
        Slot.prototype.setAttachmentTime = function (time) {
            this.attachmentTime = this.bone.skeleton.time - time;
        };
        Slot.prototype.getAttachmentTime = function () {
            return this.bone.skeleton.time - this.attachmentTime;
        };
        Slot.prototype.setToSetupPose = function () {
            this.color.setFromColor(this.data.color);
            if (this.darkColor != null)
                this.darkColor.setFromColor(this.data.darkColor);
            if (this.data.attachmentName == null)
                this.attachment = null;
            else {
                this.attachment = null;
                this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
            }
        };
        return Slot;
    }());
    spine.Slot = Slot;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SlotData = (function () {
        function SlotData(index, name, boneData) {
            this.color = new spine.Alpha(1);
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            if (boneData == null)
                throw new Error("boneData cannot be null.");
            this.index = index;
            this.name = name;
            this.boneData = boneData;
        }
        return SlotData;
    }());
    spine.SlotData = SlotData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var TextureRegion = (function () {
        function TextureRegion() {
            this.name = "";
            this.uid = "";
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.rotate = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }
        return TextureRegion;
    }());
    spine.TextureRegion = TextureRegion;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var IntSet = (function () {
        function IntSet() {
            this.array = new Array();
        }
        IntSet.prototype.add = function (value) {
            var contains = this.contains(value);
            this.array[value | 0] = value | 0;
            return !contains;
        };
        IntSet.prototype.contains = function (value) {
            return this.array[value | 0] != undefined;
        };
        IntSet.prototype.remove = function (value) {
            this.array[value | 0] = undefined;
        };
        IntSet.prototype.clear = function () {
            this.array.length = 0;
        };
        return IntSet;
    }());
    spine.IntSet = IntSet;
    var Alpha = (function () {
        function Alpha(a) {
            if (a === void 0) { a = 0; }
            this.a = a;
        }
        Alpha.prototype.set = function (a) {
            this.a = a;
            this.clamp();
            return this;
        };
        Alpha.prototype.setFromColor = function (c) {
            this.a = c.a;
            return this;
        };
        Alpha.prototype.setFromString = function (hex) {
            hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;
            this.a = (hex.length != 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
            return this;
        };
        Alpha.prototype.add = function (a) {
            this.a += a;
            this.clamp();
            return this;
        };
        Alpha.prototype.clamp = function () {
            if (this.a < 0)
                this.a = 0;
            else if (this.a > 1)
                this.a = 1;
            return this;
        };
        Alpha.rgba8888ToColor = function (color, value) {
            color.a = ((value & 0x000000ff)) / 255;
        };
        Alpha.rgb888ToColor = function (color, value) {
        };
        return Alpha;
    }());
    spine.Alpha = Alpha;
    var MathUtils = (function () {
        function MathUtils() {
        }
        MathUtils.clamp = function (value, min, max) {
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        };
        MathUtils.cosDeg = function (degrees) {
            return Math.cos(degrees * MathUtils.degRad);
        };
        MathUtils.sinDeg = function (degrees) {
            return Math.sin(degrees * MathUtils.degRad);
        };
        MathUtils.signum = function (value) {
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        };
        MathUtils.toInt = function (x) {
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        };
        MathUtils.cbrt = function (x) {
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        };
        MathUtils.PI = 3.1415927;
        MathUtils.PI2 = MathUtils.PI * 2;
        MathUtils.radiansToDegrees = 180 / MathUtils.PI;
        MathUtils.radDeg = MathUtils.radiansToDegrees;
        MathUtils.degreesToRadians = MathUtils.PI / 180;
        MathUtils.degRad = MathUtils.degreesToRadians;
        return MathUtils;
    }());
    spine.MathUtils = MathUtils;
    var Interpolation = (function () {
        function Interpolation() {
        }
        Interpolation.prototype.apply = function (start, end, a) {
            return start + (end - start) * this.applyInternal(a);
        };
        return Interpolation;
    }());
    spine.Interpolation = Interpolation;
    var Utils = (function () {
        function Utils() {
        }
        Utils.arrayCopy = function (source, sourceStart, dest, destStart, numElements) {
            for (var i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
                dest[j] = source[i];
            }
        };
        Utils.setArraySize = function (array, size, value) {
            if (value === void 0) { value = 0; }
            var oldSize = array.length;
            if (oldSize == size)
                return array;
            array.length = size;
            if (oldSize < size) {
                for (var i = oldSize; i < size; i++)
                    array[i] = value;
            }
            return array;
        };
        Utils.ensureArrayCapacity = function (array, size, value) {
            if (value === void 0) { value = 0; }
            if (array.length >= size)
                return array;
            return Utils.setArraySize(array, size, value);
        };
        Utils.newArray = function (size, defaultValue) {
            var array = new Array(size);
            for (var i = 0; i < size; i++)
                array[i] = defaultValue;
            return array;
        };
        Utils.newFloatArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Float32Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.newShortArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Int16Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.toFloatArray = function (array) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
        };
        Utils.toSinglePrecision = function (value) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
        };
        Utils.webkit602BugfixHelper = function (alpha, blend) {
        };
        Utils.contains = function (array, element, identity) {
            if (identity === void 0) { identity = true; }
            for (var i = 0; i < array.length; i++) {
                if (array[i] == element)
                    return true;
            }
            return false;
        };
        Utils.SUPPORTS_TYPED_ARRAYS = typeof (Float32Array) !== "undefined";
        return Utils;
    }());
    spine.Utils = Utils;
    var DebugUtils = (function () {
        function DebugUtils() {
        }
        DebugUtils.logBones = function (skeleton) {
            for (var i = 0; i < skeleton.bones.length; i++) {
                var bone = skeleton.bones[i];
                console.log(bone.data.name + ", " + bone.a + ", " + bone.b + ", " + bone.c + ", " + bone.d + ", " + bone.worldX + ", " + bone.worldY);
            }
        };
        return DebugUtils;
    }());
    spine.DebugUtils = DebugUtils;
    var Pool = (function () {
        function Pool(instantiator) {
            this.items = new Array();
            this.instantiator = instantiator;
        }
        Pool.prototype.obtain = function () {
            return this.items.length > 0 ? this.items.pop() : this.instantiator();
        };
        Pool.prototype.free = function (item) {
            if (item.reset)
                item.reset();
            this.items.push(item);
        };
        Pool.prototype.freeAll = function (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].reset)
                    items[i].reset();
                this.items[i] = items[i];
            }
        };
        Pool.prototype.clear = function () {
            this.items.length = 0;
        };
        return Pool;
    }());
    spine.Pool = Pool;
    var Vector2 = (function () {
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Vector2.prototype.set = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        return Vector2;
    }());
    spine.Vector2 = Vector2;
})(spine || (spine = {}));
(function () {
    if (!Math.fround) {
        Math.fround = (function (array) {
            return function (x) {
                return array[0] = x, array[0];
            };
        })(new Float32Array(1));
    }
})();
var spine;
(function (spine) {
    var Attachment = (function () {
        function Attachment(name) {
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        return Attachment;
    }());
    spine.Attachment = Attachment;
    var VertexAttachment = (function (_super) {
        __extends(VertexAttachment, _super);
        function VertexAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.id = (VertexAttachment.nextID++ & 65535) << 11;
            _this.worldVerticesLength = 0;
            _this.deformAttachment = _this;
            return _this;
        }
        VertexAttachment.prototype.computeWorldVertices = function (slot, start, count, worldVertices, offset, stride) {
            count = offset + (count >> 1) * stride;
            var skeleton = slot.bone.skeleton;
            var deformArray = slot.deform;
            var vertices = this.vertices;
            var bones = this.bones;
            if (bones == null) {
                if (deformArray.length > 0)
                    vertices = deformArray;
                var bone = slot.bone;
                var x = bone.worldX;
                var y = bone.worldY;
                var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                for (var v_1 = start, w = offset; w < count; v_1 += 2, w += stride) {
                    var vx = vertices[v_1], vy = vertices[v_1 + 1];
                    worldVertices[w] = vx * a + vy * b + x;
                    worldVertices[w + 1] = vx * c + vy * d + y;
                }
                return;
            }
            var v = 0, skip = 0;
            for (var i = 0; i < start; i += 2) {
                var n = bones[v];
                v += n + 1;
                skip += n;
            }
            var skeletonBones = skeleton.bones;
            if (deformArray.length == 0) {
                for (var w = offset, b = skip * 3; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
            else {
                var deform = deformArray;
                for (var w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3, f += 2) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
        };
        VertexAttachment.prototype.copyTo = function (attachment) {
            if (this.bones != null) {
                attachment.bones = new Array(this.bones.length);
                spine.Utils.arrayCopy(this.bones, 0, attachment.bones, 0, this.bones.length);
            }
            else
                attachment.bones = null;
            if (this.vertices != null) {
                attachment.vertices = spine.Utils.newFloatArray(this.vertices.length);
                spine.Utils.arrayCopy(this.vertices, 0, attachment.vertices, 0, this.vertices.length);
            }
            else
                attachment.vertices = null;
            attachment.worldVerticesLength = this.worldVerticesLength;
            attachment.deformAttachment = this.deformAttachment;
        };
        VertexAttachment.nextID = 0;
        return VertexAttachment;
    }(Attachment));
    spine.VertexAttachment = VertexAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
        AttachmentType[AttachmentType["Clipping"] = 6] = "Clipping";
    })(AttachmentType = spine.AttachmentType || (spine.AttachmentType = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    var BoundingBoxAttachment = (function (_super) {
        __extends(BoundingBoxAttachment, _super);
        function BoundingBoxAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Alpha(1);
            return _this;
        }
        BoundingBoxAttachment.prototype.copy = function () {
            var copy = new BoundingBoxAttachment(name);
            this.copyTo(copy);
            copy.color.setFromColor(this.color);
            return copy;
        };
        return BoundingBoxAttachment;
    }(spine.VertexAttachment));
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var PointAttachment = (function (_super) {
        __extends(PointAttachment, _super);
        function PointAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Alpha(1);
            return _this;
        }
        PointAttachment.prototype.computeWorldPosition = function (bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        };
        PointAttachment.prototype.computeWorldRotation = function (bone) {
            var cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
            var x = cos * bone.a + sin * bone.b;
            var y = cos * bone.c + sin * bone.d;
            return Math.atan2(y, x) * spine.MathUtils.radDeg;
        };
        PointAttachment.prototype.copy = function () {
            var copy = new PointAttachment(name);
            copy.x = this.x;
            copy.y = this.y;
            copy.rotation = this.rotation;
            copy.color.setFromColor(this.color);
            return copy;
        };
        return PointAttachment;
    }(spine.VertexAttachment));
    spine.PointAttachment = PointAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var RegionAttachment = (function (_super) {
        __extends(RegionAttachment, _super);
        function RegionAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.x = 0;
            _this.y = 0;
            _this.scaleX = 1;
            _this.scaleY = 1;
            _this.rotation = 0;
            _this.width = 0;
            _this.height = 0;
            _this.color = new spine.Alpha(1);
            _this.offset = spine.Utils.newFloatArray(8);
            _this.uvs = spine.Utils.newFloatArray(8);
            _this.tempColor = new spine.Alpha(1);
            return _this;
        }
        RegionAttachment.prototype.updateOffset = function () {
            var regionScaleX = this.width / this.region.originalWidth * this.scaleX;
            var regionScaleY = this.height / this.region.originalHeight * this.scaleY;
            var localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
            var localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
            var localX2 = localX + this.region.width * regionScaleX;
            var localY2 = localY + this.region.height * regionScaleY;
            var radians = this.rotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            var localXCos = localX * cos + this.x;
            var localXSin = localX * sin;
            var localYCos = localY * cos + this.y;
            var localYSin = localY * sin;
            var localX2Cos = localX2 * cos + this.x;
            var localX2Sin = localX2 * sin;
            var localY2Cos = localY2 * cos + this.y;
            var localY2Sin = localY2 * sin;
            var offset = this.offset;
            offset[RegionAttachment.OX1] = localXCos - localYSin;
            offset[RegionAttachment.OY1] = localYCos + localXSin;
            offset[RegionAttachment.OX2] = localXCos - localY2Sin;
            offset[RegionAttachment.OY2] = localY2Cos + localXSin;
            offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
            offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
            offset[RegionAttachment.OX4] = localX2Cos - localYSin;
            offset[RegionAttachment.OY4] = localYCos + localX2Sin;
        };
        RegionAttachment.prototype.setRegion = function (region) {
            this.region = region;
            var uvs = this.uvs;
        };
        RegionAttachment.prototype.computeWorldVertices = function (bone, worldVertices, offset, stride) {
            var vertexOffset = this.offset;
            var x = bone.worldX, y = bone.worldY;
            var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            var offsetX = 0, offsetY = 0;
            offsetX = vertexOffset[RegionAttachment.OX1];
            offsetY = vertexOffset[RegionAttachment.OY1];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX2];
            offsetY = vertexOffset[RegionAttachment.OY2];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX3];
            offsetY = vertexOffset[RegionAttachment.OY3];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX4];
            offsetY = vertexOffset[RegionAttachment.OY4];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        };
        RegionAttachment.prototype.copy = function () {
            var copy = new RegionAttachment(name);
            copy.region = this.region;
            copy.rendererObject = this.rendererObject;
            copy.path = this.path;
            copy.x = this.x;
            copy.y = this.y;
            copy.scaleX = this.scaleX;
            copy.scaleY = this.scaleY;
            copy.rotation = this.rotation;
            copy.width = this.width;
            copy.height = this.height;
            spine.Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, 8);
            spine.Utils.arrayCopy(this.offset, 0, copy.offset, 0, 8);
            copy.color.setFromColor(this.color);
            return copy;
        };
        RegionAttachment.OX1 = 0;
        RegionAttachment.OY1 = 1;
        RegionAttachment.OX2 = 2;
        RegionAttachment.OY2 = 3;
        RegionAttachment.OX3 = 4;
        RegionAttachment.OY3 = 5;
        RegionAttachment.OX4 = 6;
        RegionAttachment.OY4 = 7;
        RegionAttachment.X1 = 0;
        RegionAttachment.Y1 = 1;
        RegionAttachment.C1R = 2;
        RegionAttachment.C1G = 3;
        RegionAttachment.C1B = 4;
        RegionAttachment.C1A = 5;
        RegionAttachment.U1 = 6;
        RegionAttachment.V1 = 7;
        RegionAttachment.X2 = 8;
        RegionAttachment.Y2 = 9;
        RegionAttachment.C2R = 10;
        RegionAttachment.C2G = 11;
        RegionAttachment.C2B = 12;
        RegionAttachment.C2A = 13;
        RegionAttachment.U2 = 14;
        RegionAttachment.V2 = 15;
        RegionAttachment.X3 = 16;
        RegionAttachment.Y3 = 17;
        RegionAttachment.C3R = 18;
        RegionAttachment.C3G = 19;
        RegionAttachment.C3B = 20;
        RegionAttachment.C3A = 21;
        RegionAttachment.U3 = 22;
        RegionAttachment.V3 = 23;
        RegionAttachment.X4 = 24;
        RegionAttachment.Y4 = 25;
        RegionAttachment.C4R = 26;
        RegionAttachment.C4G = 27;
        RegionAttachment.C4B = 28;
        RegionAttachment.C4A = 29;
        RegionAttachment.U4 = 30;
        RegionAttachment.V4 = 31;
        return RegionAttachment;
    }(spine.Attachment));
    spine.RegionAttachment = RegionAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var canvas;
    (function (canvas) {
        var SkeletonRenderer = (function () {
            function SkeletonRenderer(context) {
                this.debugRendering = false;
                this.vertices = spine.Utils.newFloatArray(8 * 1024);
                this.tempColor = new spine.Alpha();
                this.ctx = context;
            }
            SkeletonRenderer.prototype.draw = function (skeleton) {
                this.drawImages(skeleton);
            };
            SkeletonRenderer.prototype.drawImages = function (skeleton) {
                var ctx = this.ctx;
                var drawOrder = skeleton.drawOrder;
                if (this.debugRendering)
                    ctx.strokeStyle = "green";
                ctx.save();
                for (var i = 0, n = drawOrder.length; i < n; i++) {
                    var slot = drawOrder[i];
                    if (!slot.bone.active)
                        continue;
                    var attachment = slot.getAttachment();
                    var regionAttachment = null;
                    var region = null;
                    var spriteSheet = null;
                    var spriteInfo = null;
                    if (attachment instanceof spine.RegionAttachment) {
                        regionAttachment = attachment;
                        region = regionAttachment.region;
                        var flatName = region.name.replace(/\//g, "_");
                        spriteInfo = TGE.AssetManager.Get(flatName + "_" + region.uid);
                        spriteSheet = spriteInfo.spriteSheet;
                    }
                    else
                        continue;
                    var skeleton_1 = slot.bone.skeleton;
                    var skeletonColor = skeleton_1.color;
                    var slotColor = slot.color;
                    var regionColor = regionAttachment.color;
                    var alpha = skeletonColor.a * slotColor.a * regionColor.a;
                    var color = this.tempColor;
                    color.set(alpha);
                    var att = attachment;
                    var bone = slot.bone;
                    var w = region.width;
                    var h = region.height;
                    ctx.save();
                    ctx.transform(bone.a, bone.c, bone.b, bone.d, bone.worldX, bone.worldY);
                    ctx.translate(attachment.offset[0], attachment.offset[1]);
                    ctx.rotate(attachment.rotation * Math.PI / 180);
                    var atlasScale = att.width / w;
                    ctx.scale(atlasScale * attachment.scaleX, atlasScale * attachment.scaleY);
                    ctx.translate(w / 2, h / 2);
                    ctx.scale(1, -1);
                    ctx.translate(-w / 2, -h / 2);
                    if (color.a != 1) {
                        ctx.globalAlpha = color.a;
                    }
                    ctx.drawImage(spriteSheet, region.x, region.y, w, h, 0, 0, w, h);
                    if (this.debugRendering)
                        ctx.strokeRect(0, 0, w, h);
                    ctx.restore();
                }
                ctx.restore();
            };
            SkeletonRenderer.QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
            SkeletonRenderer.VERTEX_SIZE = 2 + 2 + 4;
            return SkeletonRenderer;
        }());
        canvas.SkeletonRenderer = SkeletonRenderer;
    })(canvas = spine.canvas || (spine.canvas = {}));
})(spine || (spine = {}));
//# sourceMappingURL=spine-canvas.js.map