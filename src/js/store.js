import { createStore } from "framework7/lite";

const store = createStore({
    state: {
        products: [
            {
                id: "1",
                title: "Apple iPhone 8",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis.",
            },
            {
                id: "2",
                title: "Apple iPhone 8 Plus",
                description:
                    "Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus.",
            },
            {
                id: "3",
                title: "Apple iPhone X",
                description:
                    "Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis.",
            },
        ],
    },
    getters: {
        products({ state }) {
            return state.products;
        },
    },
    actions: {
        addProduct({ state }, product) {
            state.products = [...state.products, product];
        },
    },
});
export default store;
