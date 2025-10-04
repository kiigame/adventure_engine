/** */
class ItemBuilder {

    constructor() {
    }

    build(data, key) {
        const item = {
            attrs: {
                "category": data.category,
                "id": key,
                "src": data.src,
                "visible": false,
                "draggable": true,
                "animated": false,
            },
            className: "Image"
        };
        return item;
    }
}

export default ItemBuilder;
