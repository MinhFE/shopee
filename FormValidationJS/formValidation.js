// Doi tuong Validator
function Validator(options) {

    var selectorRules = {};

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    function validate(inputElement, rule) {
        var errorMessage 
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]
        //lặp qua từng rule và kiểm tra
        // nếu có lỗi thì dừng kiểm tra 
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                    formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break
        }

            if(errorMessage) {
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroupSelector).classList.add('invalid')
            } else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
            return !errorMessage;
    }

    var formElement = document.querySelector(options.form)
    
    if(formElement) {

        // xử lý submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            //Lặp qua các rule và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid) {
                // submit voi javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]')
                    var formInput = Array.from(enableInput).reduce(function(values, input) {
                        switch(input.type) {
                            case 'checkbox':
                                if(!input.matches(':checked')){ 
                                    values[input.name] = ''
                                    return values};
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    }, {})
                    options.onSubmit(formInput)
                }
                // submit vs hanh vi mat Dinh
                else {
                    formInput.submit();
                }
            } 
        }

        options.rules.forEach(function(rule) {

            // Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]; 
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                // xu ly moi khi nguoi dung nhap vao input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}
// Dinh nghia cac rules
// Nguyen tac cua cac rule
// 1. khi co loi thi tra ra message loi
// 2. khi khong co loi thi khong tra ra cai gi ca (underfinded)
Validator.isRequired = function (selector) {
    return {
        selector,
        test: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value.trim()) ? undefined : 'Hay nhap email hop le';
        }
    }
}

Validator.isMinLength = function (selector, min) {
    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined : `Hãy nhập tối thiểu ${min} kí tự`;
        }
    }
}

Validator.isConfirmPassword = function (selector, valueConFirm, textFalse) {
    return {
        selector,
        test: function(value) {
            return value === valueConFirm() ? undefined : textFalse
        }
    }
}
