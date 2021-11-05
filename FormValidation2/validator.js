function validator(formSelector) {
    var _this = this;

    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }


    /**
     * Quy ước tạo rule:
     * Nếu có lỗi thì return về `error message`
     * Nếu không có lỗi thì return về `undefined`
     */
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min}`
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max}`
            }
        }
    }
    
    var formRules = {};

    // Lấy Element DOM của formSelector
    var formElement = document.querySelector(formSelector);
    
    if(formElement) {
        // Lấy ra các element có Attribute là name và rules
        var inputs = formElement.querySelectorAll('[name][rules]')

        for(var input of inputs) {

            var rules = input.getAttribute('rules').split('|')

            for (var rule of rules) {
                var ruleInfo
                var isRuleHasValue = rule.includes(':')

                if(isRuleHasValue) {
                    ruleInfo =  rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // Lắng nghe sự kiện để validate (blur, chang, ...)
            input.onblur = handleEvent;
            input.oninput = handleClearError;
        }

        // Hàm thực hiện validate
        function handleEvent(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for(var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) break
            }
            //Nêu có lỗi thì hiển thị lỗi ra UI
            if (errorMessage) {
                var formGroup =  getParent(event.target, '.form-group')
                if(formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
                
            }

            return !errorMessage;
        }

        // Hàm clear message
        function handleClearError(event) {
            var formGroup =  getParent(event.target, '.form-group')
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage) {
                        formMessage.innerText = '';
                    }
            }
        }
    }

    // Xử lý hành vi submitForm
    formElement.onsubmit = function(event) {
        var isValid  = true;
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs) {
            if(!handleEvent({target: input})) {
                isValid = false;
            }
        }
            // Khi không có lỗi thì submitForm
        if(isValid) {
            if(typeof _this.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]')
                var formValue = Array.from(enableInput).reduce(function(values, input) {
                    values[input.name] = input.value;
                    return values;
                }, {})
                _this.onSubmit(formValue);
            } else {
                formElement.submit();s
            }
        }
    }
}