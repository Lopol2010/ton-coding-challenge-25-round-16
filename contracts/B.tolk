tolk 1.2

struct Storage {
    id: uint32
}

struct(0x7e8764ef) ProvokeBounce {}
type AllowedMessage = ProvokeBounce;

fun Storage.load() {
    return Storage.fromCell(contract.getData())
}

fun Storage.save(self) {
    contract.setData(self.toCell())
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    match (msg) {
        ProvokeBounce => {
            throw 337
        }

        else  => {
            // ignore other messages such as deploy
            assert (in.body.isEmpty()) throw 1025
        }
    }
}