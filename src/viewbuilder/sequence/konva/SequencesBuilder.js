/** */
class SequencesBuilder {

    constructor(sequenceBuilder) {
        this.sequenceBuilder = sequenceBuilder;
    }

    build(sequences_json) {
        const builtSequences = [];
        for (const key in sequences_json) {
            builtSequences.push(
                this.sequenceBuilder.build(
                    sequences_json[key].slides, key
                )
            );
        }
        return builtSequences;
    }
}

export default SequencesBuilder;
