function TouchMapper(element) {
    var div = document.querySelector(element);
    div.addEventListener("touchstart", this.handler, true);
    div.addEventListener("touchmove", this.handler, true);
    div.addEventListener("touchend", this.handler, true);
    div.addEventListener("touchcancel", this.handler, true);
}

TouchMapper.prototype.handler = function (event) {
    'use strict';
    var first, touches, type, simulatedEvent;
    touches = event.changedTouches;
    first = touches[0];
    type = "";
    switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type="mousemove";
            break;        
        case "touchend":
            type="mouseup";
            break;
        default: return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

new TouchMapper("#chaos-pad");