import { el, setChildren } from 'redom';
import cardValidator from 'card-validator';
import binking from 'binking';
import isEmail from 'validator/lib/isEmail';
import Inputmask from 'inputmask';

(() => {
  const formBox = el('', {
    class: 'd-flex flex-wrap box--padd box',
  });

  const form = el('form', {
    class: 'form form--padd d-flex flex-wrap w-100 gap-3 bg-body-tertiary border border-secondary rounded',
  });

  const wrapperLogo = el('', {
    class: 'logo',
  });

  const typeLogo = el('img', {
    class: 'logo__img',
  });

  const btn = el('button', 'Оплатить', {
    class: 'btn btn-secondary btn-lg form__btn',
    type: 'button',
    disabled: 'true',
    onclick: testBtn
  });

  function testBtn() {
    alert('Тест на валидность полей пройден');
  }

  const cardNumber = createInput('cardNumber', numValid);
  const cardDate = createInput('cardDate', dateValid);
  const cardCv = createInput('cardCv', cvValid);
  const email = createInput('email', emailValid);

  setChildren(wrapperLogo, typeLogo);
  setChildren(form, [
    createWrapper(cardNumber, 'Номер карты', 'cardNumber', 'cardNumberError'),
    createWrapper(cardDate, 'Действует до', 'cardDate', 'cardDateError'),
    createWrapper(cardCv, 'Номер CVC', 'cardCv', 'cardCvError'),
    createWrapper(email, 'Email', 'email', 'emailError'),
    btn, wrapperLogo
  ]);
  setChildren(formBox, form);
  setChildren(document.body, formBox);

  Array.from(document.querySelectorAll('.form-floating')).forEach((el, index) => {
    (index === 0 || index === 3) ? el.classList.add('input--big') : el.classList.add('input--small');
  });

  Inputmask('9999 9999 9999 9999 [99]').mask(cardNumber);
  Inputmask("datetime", { jitMasking: true, inputFormat: "mm/yy" }).mask(cardDate);
  Inputmask('999').mask(cardCv);
  Inputmask('email').mask(email);

  cardNumber.addEventListener('input', () => setLogoCardType());


  function createWrapper(cardInput, textLabel, cardName, errorText) {
    const wrapper = el('', {
      class: 'form-floating',
    });

    setChildren(wrapper, [cardInput, createLabel(textLabel, cardName), createError(errorText)]);

    return wrapper;
  }

  function createInput(id, fnBlur) {
    return el('input', {
      class: 'form-control',
      placeholder: ' ',
      id: id,
      onblur: fnBlur,
      onfocus: inFocus,
    });
  }

  function createLabel(labelText, cardName) {
    return el('label', labelText, {
      class: 'label--fs',
      for: cardName,
    });
  }

  function createError(errorId) {
    return el('', {
      id: errorId,
      class: 'invalid-feedback error',
    });
  }

  function setLogoCardType() {
    binking.setDefaultOptions({
      strategy: "api",
      apiKey: "YOUR_API_KEY",
    });

    binking(cardNumber.value, function (result) {
      if (result.formBrandLogoSvg) typeLogo.src = result.formBrandLogoSvg;
      typeLogo.style.display = result.formBrandLogoSvg ? "block" : "none";
    });
  }

  function isValid(input) {
    input.ariaInvalid = false;
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  }

  function isInvalid(input, errorId, errorText) {
    const error = document.getElementById(errorId);
    error.textContent = errorText;
    input.ariaInvalid = true;
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }

  function inFocus() {
    this.classList.remove('is-invalid');
    this.classList.remove('is-valid');
    this.ariaInvalid === 'true';
  }

  function numValid() {
    if (cardNumber.value !== '') {
      const numberValidation = cardValidator.number(cardNumber.value);

      (numberValidation.isValid) ? isValid(cardNumber) : isInvalid(cardNumber, 'cardNumberError', 'Некорректный номер');
    } else {
      isInvalid(cardNumber, 'cardNumberError', 'Обязательное к заполнению поле в числовом формате');
    }

    setClassForValidForm();
  }

  function dateValid() {
    const now = new Date();
    const nowYear = +((now.getFullYear()).toString().slice(2));
    const nowMonth = now.getMonth() + 1;

    if (cardDate.value !== '') {
      const dateValidation = cardValidator.expirationDate(cardDate.value);

      if (nowYear === +dateValidation.year) {
        if (dateValidation.month !== null && dateValidation.month[0] === '0') {
          if (+dateValidation.month.slice(1) <= nowMonth) dateValidation.isValid = false;
        } else {
          if (+dateValidation.month <= nowMonth) dateValidation.expirationMonth = false;
        }
      }

      (dateValidation.isValid) ? isValid(cardDate) :
        isInvalid(cardDate, 'cardDateError', 'Минимально возможная дата - не позднее чем через месяц от текущей даты');
    } else {
      isInvalid(cardDate, 'cardDateError', 'Обязательное к заполнению поле в числовом формате');
    }

    setClassForValidForm();
  }

  function cvValid() {
    if (cardCv.value !== '') {
      const cvValidation = cardValidator.cvv(cardCv.value);

      (cvValidation.isValid) ? isValid(cardCv) : isInvalid(cardCv, 'cardCvError', 'Слишком короткий номер');
    } else {
      isInvalid(cardCv, 'cardCvError', 'Обязательное к заполнению поле в числовом формате');
    }

    setClassForValidForm();
  }

  function emailValid() {
    if (email.value !== '') {
      (isEmail(email.value)) ? isValid(email) : isInvalid(email, 'emailError', 'Проверьте наличие \'@xxx.xx\'');
    } else {
      isInvalid(email, 'emailError', 'Обязательное к заполнению поле');
    }

    setClassForValidForm();
  }

  function setClassForValidForm() {
    const inputArr = Array.from(document.querySelectorAll('input'));

    const isValid = inputArr.every(input => {
      return input.ariaInvalid === 'false';
    });

    if (isValid) {
      form.classList.add('border-success');
      btn.disabled = false;
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-success');
    } else {
      form.classList.remove('border-success');
      btn.disabled = true;
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-success');
    }
  }
})();
