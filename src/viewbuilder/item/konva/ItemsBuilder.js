/** */
class ItemsBuilder {

    constructor(itemBuilder) {
        this.itemBuilder = itemBuilder;
    }

    build(items_json) {
        const builtItems = [];
        for (const key in items_json) {
            builtItems.push(
                this.itemBuilder.build(
                    items_json[key], key
                )
            );
        }
        return builtItems;
    }
}

export default ItemsBuilder;
