function suggest(el, splits, items) {

    var input = el
    splits = splits || ['.', '@']
    var span = createSpan('text')
    var focus = createSpan('focus')
    var clone = createCloneDom([span, focus])
    document.body.appendChild(clone)

    var dropdown = createDropdown(items)
    document.body.appendChild(dropdown)

    var options = []
    input.addEventListener('keydown', x => {
        switch (x.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Enter':
                x.preventDefault()
                x.stopPropagation()
                break;
        }
    })

    input.addEventListener('blur', x => {
        dropdown.style.display = 'none'
    })

    input.addEventListener('keyup', x => {
        //syncSize
        clone.style.width = x.target.clientWidth + 'px'
        clone.style.top = x.target.offsetTop + 'px'
        clone.style.left = x.target.offsetLeft + 'px'
        var styles = window.getComputedStyle(x.target, null)
        clone.style.fontSize = styles.fontSize
        clone.style.fontFamily = styles.fontFamily

        if (splits.some(y => y == x.key)) {
            options = getOption(x.target.value.substring(0, x.target.selectionStart), x.key, splits, items)
            appendOption(options)
            showSuggest(x.target)
        } else {
            //key control
            switch (x.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    var item = Array.from(dropdown.childNodes).filter(y => y.nodeType === 1)
                    var arrow = x.key == 'ArrowDown' ? 1 : -1
                    var start = x.key == 'ArrowDown' ? 0 : item.length - 1
                    var findFlag = false
                    for (var i = start; i < item.length && i >= 0; i = i + arrow) {
                        if (item[i].className == 'action') {
                            item[i].className = ""
                            var next = ((i + arrow) < 0 ? item.length - 1 : i + arrow) % (item.length)
                            item[next].className = "action"
                            findFlag = true
                            break;
                        }
                    }
                    if (!findFlag) item[0].className = "action"
                    break;
                case 'Enter':
                    if (dropdown.style.display != 'none') {
                        var item = Array.from(dropdown.childNodes).filter(x => x.className === 'action')
                        var value = item[0].dataset.value
                        item[0].className = ""
                        var oldValue = x.target.value
                        var newValue = span.textContent + value + oldValue.substr(x.target.selectionStart, oldValue.length - x.target.selectionStart)
                        x.target.value = newValue
                    }
                    dropdown.style.display = 'none'
                    break;
                case 'Escape':
                    dropdown.style.display = 'none'
                    break;
                default:
                    if (dropdown.style.display != 'none'.toLowerCase) {
                        var leftText = span.textContent
                        var rightText = x.target.value.replace(leftText, '')
                        console.log(rightText)
                        appendOption(options.filter(y => y.toLowerCase().indexOf(rightText.toLowerCase()) > -1))
                    }

                    break;
            }
        }

    })

    var showSuggest = function(target) {
        span.innerText = target.value.substring(0, target.selectionStart)
        var focusPoint = getPoint(focus)
        dropdown.style.display = 'block'
        dropdown.style.left = focusPoint.left + 'px'

        dropdown.style.top = null
        if (target.tagName != "INPUT")
            dropdown.style.top = span.offsetHeight + 8 - (target.scrollTop || 0) + 'px'
    }

    var getPoint = function(dom) {
        var box = dom.getBoundingClientRect()
        var doc = dom.ownerDocument
        var body = doc.body
        var docElem = doc.documentElement
        var clientTop = docElem.clientTop || body.clientTop || 0
        var clientLeft = docElem.clientLeft || body.clientLeft || 0
        var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop
        var left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft
        return {
            left: left,
            top: top,
            right: left + box.width,
            bottom: top + box.height
        };
    }

    function createDropdown(items) {
        var element = document.createElement('ul')
        element.className = 'suggest-list'
        element.style.position = "fixed"
        element.style.display = "none"
        element.style.listStyle = "none"
        element.style.padding = 0
        element.style.margin = 0
        return element
    }

    function createSpan(name) {
        var element = document.createElement('span')
        element.name = name
        return element
    }

    function createCloneDom(childElement) {
        let element = document.createElement('div');
        element.style.position = "absolute"
        element.style.display = "inline-block"
        element.style.boxSizing = "border-box"
        element.style.wordBreak = "break-all"
        element.style.visibility = "hidden"
        element.style.zIndex = -99999
        childElement.forEach(x => {
            element.appendChild(x)
        })
        return element;
    }

    function getOption(text, key, splits, items) {

        var keyWord = getKeyWord(splits, text)

        var option = Array.isArray(items) ? items : []
        if (option.length == 0 && typeof(items) == 'function') {
            option = function() { return items(keyWord) }()
        }

        if (option.length == 0) console.error("參數有誤", items)

        return option
    }

    function getKeyWord(splits, text) {
        var point = 0
        splits.forEach(x => {
            var temp = text.lastIndexOf(x, text.length - 2)
            point = temp > point ? temp : point
        })
        var start = point == 0 ? 0 : point + 1
        var end = text.length - 1
        var keyWord = text.substr(start, end - start)
        return keyWord
    }

    function appendOption(options) {
        dropdown.innerHTML = ''
        options.forEach(x => {
            let li = document.createElement('li')
            li.innerText = x
            li.dataset.value = x
            dropdown.appendChild(li)
        })
    }
}