"use strict";

const yearlyMultiplier = 10;
const maxSteps = 5;
let curStep = 1;
const curState = {
	packet: { price: 0, name: "" },
	yearly: false,
	addons: [],
};

const form = document.querySelector(".form");
const summary = document.querySelector(".summary");
const steps = document.querySelectorAll(".step");
const stepIndicators = document.querySelectorAll(".step__step");
const packets = document.querySelectorAll(".select__option");
const addons = document.querySelectorAll(".addons__option");

const btnNext = document.querySelector(".btn__next");
const btnBack = document.querySelector(".btn__back");
const btnConfirm = document.querySelector(".btn__confirm");
const btnContainer = document.querySelector(".form__btns");

const addonObj = (addon, price, initialPrice) => ({ addon, price, initialPrice });

function summaryTemplate(data) {
	const prices = curState.addons.map((el) => el.price);
	const total = prices.reduce((acc, price) => (acc += price), 0) + data.packet.price;

	return `
							<div class="summary__wrapper">
								<div class="summary__header">
									<div class="summary__chosen">
										<p class="summary__packet">${data.packet.name} (${data.yearly ? "Yearly" : "Monthly"})</p>
										<p class="btn summary__change">Change</p>
									</div>

									<p class="summary__packet-price">$${data.packet.price}/yr</p>
								</div>

								<div class="summary__info">
								${data.addons.length ? joinTemplate(data.addons, addonTemplate, true) : "No add-ons were selected"}

								</div>
							</div>

							<div class="summary__total-box">
								<p class="summary__text">Total (${data.yearly ? "Yearly" : "Monthly"})</p>
								<p class="summary__total">$${total}/yr</p>
							</div>
	
	
	`;
}

function addonTemplate(data) {
	return `
		<div class="summary__addon">
			<p class="summary__addon-name">${data.addon}</p>
			<p class="summary__addon-price">+$${data.price}/yr</p>
		</div>
	`;
}

function validateEmail(email) {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
}

function joinTemplate(arr, templateFn, join = false) {
	const newArr = arr.map((el) => templateFn(el));
	return join ? newArr.join("") : newArr;
}

function renderHTML(parentEl, html, pos, clear = false) {
	clear ? (parentEl.innerHTML = "") : (clear = false);
	parentEl.insertAdjacentHTML(pos, html);
	return;
}

function validateInputLength(input) {
	return input.trim().length > 3;
}

function validateNumber(num) {
	const str = String(num);
	return str.length > 8 && str.length < 13;
}

function activateStepIndicator(step, indicators) {
	indicators.forEach((el) => {
		el.classList.remove("step--active");
	});

	if (step > 0 && step < maxSteps) {
		const curStep = document.querySelector(`.step__step-${step}`);
		curStep.classList.add("step--active");
	}

	return;
}

function moveToStep(step, steps) {
	steps.forEach((el, i) => {
		el.classList.add("hidden");
	});

	if (step > 0 && step < maxSteps + 1) {
		const currStep = document.querySelector(`.step--${step}`);
		currStep.classList.remove("hidden");
		activateStepIndicator(step, stepIndicators);
	}

	return;
}

function validatePersonalInfo(name, email, number) {
	// Version 2
	/*
	const validations = [
		{
			field: name,
			validator: validateInputLength,
			message: "Must be a Valid Name!",
		},
		{
			field: email,
			validator: validateEmail,
			message: "Must be a Valid Email!",
		},
		{
			field: number,
			validator: validateNumber,
			message: "Must be a Valid Number!",
		},
	];

	function handleFieldValidation(field, validator, message) {
		const errorLabel = field.parentElement.querySelector(".form__label-error");
		const isValid = validator(field.value);

		errorLabel.textContent = isValid ? "" : message;
		field.classList[isValid ? "remove" : "add"]("input--error");

		return isValid;
	}

	return validations.every(({ field, validator, message }) => handleFieldValidation(field, validator, message));
	*/

	function toggleErrors(el, errorLabel, msg, type) {
		el.classList[type]("input--error");
		errorLabel.textContent = msg;
	}

	function validateField(field, validator, errorMessage) {
		const errLabel = field.parentElement.querySelector(".form__label-error");
		const isValid = validator(field.value);

		toggleErrors(field, errLabel, isValid ? "" : errorMessage, isValid ? "remove" : "add");

		return isValid;
	}

	let state = true;

	if (!validateField(email, validateEmail, "Must be a Valid Email!")) state = false;

	if (!validateField(name, validateInputLength, "Must be a Valid Name!")) state = false;

	if (!validateField(number, validateNumber, "Must have 8 to 12 numbers")) state = false;

	return state;
}

function deleteItem(arr, key, value) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][key] == value) return arr.splice(i, 1);
	}

	return false;
}

btnNext.addEventListener("click", (e) => {
	const { target } = e;
	const name = document.getElementById("name");
	const email = document.getElementById("email");
	const number = document.getElementById("phone");

	if (!validatePersonalInfo(name, email, number)) return;
	if (curStep == 2 && curState.packet.price == 0) curStep = 1;

	curStep++;

	if (curStep == 4)
		mutateArr(curState.addons, (el) =>
			curState.yearly ? (el.price = el.initialPrice * yearlyMultiplier) : (el.price = el.initialPrice)
		);

	if (curStep >= 1) btnBack.classList.remove("hidden");
	if (curStep == 4) renderHTML(summary, summaryTemplate(curState), "afterbegin", true);
	if (curStep > 4) {
		curStep = 5;
		btnContainer.classList.add("hidden");
	}

	return moveToStep(curStep, steps);
});

btnBack.addEventListener("click", (e) => {
	const { target } = e;
	curStep--;

	if (curStep < 2) {
		curStep = 1;
		btnBack.classList.add("hidden");
	}

	moveToStep(curStep, steps);
});

btnConfirm.addEventListener("click", (e) => {
	steps.forEach((el) => el.classList.add("hidden"));
	return document.querySelector(".step__ending").classList.remove("hidden");
});

function mutateArr(arr, fn) {
	for (let i = 0; i < arr.length; i++) fn(arr[i]);
}

form.addEventListener("click", (e) => {
	const { target } = e;

	if (target.matches(".select__option")) {
		const {
			dataset: { value, price },
		} = target;

		curState.packet.name = value;
		curState.packet.price = curState.yearly ? Number(price) * yearlyMultiplier : Number(price);
		packets.forEach((el) => el.classList.remove("select--active"));
		target.classList.add("select--active");

		return;
	}

	if (target.matches(".ball")) {
		curState.yearly = !curState.yearly;
		mutateArr(curState.addons, (el) =>
			curState.yearly ? (el.price = el.initialPrice * yearlyMultiplier) : (el.price = el.initialPrice)
		);

		curState.packet.price = curState.yearly ? curState.packet.price * yearlyMultiplier : curState.packet.price / 10;

		target.classList.toggle("slider--active");
		packets.forEach((el) => el.querySelector(".select__yearly").classList.toggle("hidden"));

		return;
	}

	if (target.matches(".addons__cb")) {
		const addon = target.closest(".addons__option");
		const {
			dataset: { price, name },
		} = addon;
		const addonsArr = curState.addons.map((el) => el.addon);

		addon.classList.toggle("addons--active");
		if (addonsArr.includes(name)) return deleteItem(curState.addons, "addon", name);
		curState.addons.push(addonObj(name, Number(price), Number(price)));

		return;
	}

	if (target.matches(".summary__change")) {
		curStep = 2;
		activateStepIndicator(curStep, stepIndicators);
		moveToStep(curStep, steps);

		return;
	}
});
