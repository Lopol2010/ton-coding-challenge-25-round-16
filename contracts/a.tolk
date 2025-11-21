tolk 1.2

struct Storage {
    id: uint32
    score: uint256
    gameContract: address
}

struct (0x7e8764ef) ProvokeBounce {}

fun Storage.load() {
    return Storage.fromCell(contract.getData())
}

fun Storage.save(self) {
    contract.setData(self.toCell())
}

fun onInternalMessage(in: InMessage) {

    val msg = lazy ProvokeBounce.fromSlice(in.body);
    match (msg) {
        ProvokeBounce => {
            val storage = lazy Storage.load();
            val request = createMessage({
                bounce: BounceMode.RichBounce,
                value: ton("0.5"),
                dest: storage.gameContract,
                body: msg
            });
            request.send(SEND_MODE_REGULAR);
        }
        else => {
            // ignore other messages such as deploy
            assert (in.body.isEmpty()) throw 0xFFFF
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {
    val richBounceBody = lazy RichBounceBody.fromSlice(in.bouncedBody);
    val originalBodyOpCode = richBounceBody.originalBody.beginParse().loadUint(32);
    var storage = lazy Storage.load();
    // reset score based on RichBounce data
    match (originalBodyOpCode) {
        ProvokeBounce.getDeclaredPackPrefix() => {
            storage.score = 1000 + richBounceBody.exitCode;
            // also change ID just for fun
            storage.id = originalBodyOpCode;
        },
        else => {
            // this branch is probably unreacheable 
            storage.score = richBounceBody.exitCode as uint256;
        },
    }
    storage.save();
}

get fun currentScore(): int {
    val storage = lazy Storage.load();
    return storage.score;
}

get fun initialId(): int {
    val storage = lazy Storage.load();
    return storage.id;
}
