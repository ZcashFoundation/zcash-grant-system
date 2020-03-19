
from ..config import BaseTestConfig
from grant.utils.validate import is_z_address_valid


good_addresses = [
    "zs15el0hzs4w60ggfy6kq4p3zttjrl00mfq7yxfwsjqpz9d7hptdtkltzlcqar994jg2ju3j9k85zk",
    "zs15xh8vjmlnqknztlgs7s8cu9wlj4rnd0m7hpyjwkjehalhlgwhfkvqnp8ycdpvhzfwywnc9r7yqs",
    "zs1h6u0s750jtqthyf5dcck5xgvhadfsvp6vj0meem9y8ledq5r7gc6fnrgeseeprnmkzfwk8x4erc",
    "zs1ke0qynx5hvx6rkqk2cg6eg2cdc7kn6ugs7ye0907pr6d09d6dsmzcxzhpawpcj73nk4svc6ualm",
    "zs1m576g2evlaem403jlam3s08aned3srg5cvwphm4w7jjxylxsulzegusjpjxstau0klzckhld4s4",
    "zs1su7cu6kgxp8luxs4rvvy4rd42caau7jkxmaufmj5ny6e8nuctuw4cptepjff6m8kvnsdywt733k",
    "zs1qyk7tqzgreu9qsxs6ze0ptgm7tlr9j9e2dumqv5en7whhwwznscll49nteghtegz4mvtj7nt304",
    "zs15vku5xmethefjarje8e9ee82znhtzlyesskee5fz0kge3m4sealp3xaqdx2se6gj2e2uzw5amnz",
    "zs1szg7qncv0ywjppttagxecetlr5gler7uwcqdcfrshugh27l8mux209ff243fy60svphzvz8fss0",
    "zs1rdk0xkrk2mxjge33su9fshxzrdpg5hz25zutl82l6gjyz5ph5lw9hhtd759hdg8qqttyxpqudxc"

]

bad_addresses = [
    None,
    False,
    3,
    "",
    "cs15el0hzs4w60ggfy6kq4p3zttjrl00mfq7yxfwsjqpz9d7hptdtkltzlcqar994jg2ju3j9k85zk",
    "zs15el0hzs4w60ggfy6kq4p3zttjrl00mfq7yxfwsjqpz9ddhptdtkltzlcqar994jg2ju3j9k85zz",
    "zs15xh8vjmlnqknztlgs7s8cu9wlj4r0d0m7hpyjwkjehalhlgwhfkvqnp8ycdpvhzfwywnc9r7yqs",
    "zs1h6u0s750jtqthyf5dcck5xgvhadfsvp6vj0eeem9y8ledq5r7gc6fnrgeseeprnmkzfwk8x4erc",
    "zs1ke0qynx5hvx6rkqk2cg6eg2cdc7kn6ugs7yd0907pr6d09d6dsmzcxzhpawpcj73nk4svc6ualm",
    "zs1m576g2evlaem403jlam3s08aned3srg5cvwph4w7jjxylxsulzegusjpjxstau0klzckhld4s4",
    "zs1su7cu6kgxp8luxs4rvvy4rd42caau7jkxmauhfmj5ny6e8nuctuw4cptepjff6m8kvnsdywt733k",
    "zs1qyk7tqzgreu9qsxs6ze0ptgm7tlr9j9e2duv5en7whhwwznscll49nteghtegz4mvtj7nt304",
    "zs15vku5xmethefjarje8e9ee82znhtzlzwyesskee5fz0kge3m4sealp3xaqdx2se6gj2e2uzw5amnz",
    "zs1szg7qncv0ywjppttagxecetlr5gler70wcqdcfrshugh27l8mux209ff243fy60svphzvz8fss0",
    "zs1rdk0xkrk2mxjge33su9fshxzrdpg5hz25zutl82l6gjyz5ph5tw9hhtd759hdg8qqttyxpqudxc"
]


class TestValidate(BaseTestConfig):

    def test_good_addresses_should_be_valid(self):
        for addr in good_addresses:
            is_valid = is_z_address_valid(addr)
            self.assertTrue(is_valid)

    def test_bad_addresses_should_be_invalid(self):
        for addr in bad_addresses:
            is_valid = is_z_address_valid(addr)
            self.assertFalse(is_valid)
