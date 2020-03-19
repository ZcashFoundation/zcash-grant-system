from grant.utils.bech32 import bech32_decode


def is_z_address_valid(addr: str):
    if type(addr) != str:
        return False

    if addr[:3] != 'zs1':
        return False

    hrp, data = bech32_decode(addr)

    if hrp is None:
        return False

    if data is None:
        return False

    return True
