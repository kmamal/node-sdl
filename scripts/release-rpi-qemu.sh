#!/usr/bin/env bash

set -eEu -o pipefail
set -x

OS="raspios_lite_arm64"
DATE="2023-05-03"
IMAGE="$DATE-raspios-bullseye-arm64-lite.img"
MOUNT="/mnt/raspbian"
LOOP="/dev/loop4"

DIR="/tmp/node-sdl-rpi-qemu"
rm -rf "$DIR" || true
mkdir -p "$DIR"
cd "$DIR"
echo "Working in $DIR"


sudo apt-get update
sudo apt-get install -y xz-utils qemu-system-arm expect

wget --progress=dot:giga "https://downloads.raspberrypi.org/$OS/images/$OS-$DATE/$IMAGE.xz"
unxz "$IMAGE.xz"

qemu-img resize "$IMAGE" 4G

expect -f - <<- EOF
	set timeout -1
	# exp_internal 1

	spawn fdisk {$IMAGE}

	expect -exact {Command (m for help): }
	send -- [string cat {d} "\n"]

	expect -exact {Partition number (1,2, default 2): }
	send -- [string cat {} "\n"]

	expect -exact {Command (m for help): }
	send -- [string cat {n} "\n"]

	expect -exact {Select (default p): }
	send -- [string cat {} "\n"]

	expect -exact {Partition number (2-4, default 2): }
	send -- [string cat {} "\n"]

	expect -exact {First sector (2048-8388607, default 2048): }
	send -- [string cat {532480} "\n"]

	expect -exact {(532480-8388607, default 8388607): }
	send -- [string cat {} "\n"]

	expect -exact {Do you want to remove the signature?}
	send -- [string cat {N} "\n"]

	expect -exact {Command (m for help): }
	send -- [string cat {w} "\n"]

	expect eof
EOF

sudo losetup -P "${LOOP}" "$IMAGE"
sudo e2fsck -fa "${LOOP}p2" || true
sudo resize2fs "${LOOP}p2"
sudo losetup -d "${LOOP}"

sudo mkdir -p "$MOUNT"
sudo mount -o loop,offset=4194304 "$IMAGE" "$MOUNT"

printf 'pi:$6$c70VpvPsVNCG0YR5$l5vWWLsLko9Kj65gcQ8qvMkuOoRkEagI90qi3F/Y7rm8eNYZHW8CY6BOIKwMH7a3YYzZYL90zf304cAHLFaZE0' | sudo tee "$MOUNT/userconf" > /dev/null

expect -f - <<- EOF
	set timeout -1
	exp_internal 1

	spawn qemu-system-aarch64 \
		-machine raspi3b \
		-cpu cortex-a72 \
		-dtb "$MOUNT/bcm2710-rpi-3-b-plus.dtb" \
		-m 1G -smp 4 -nographic -monitor none -serial stdio \
		-kernel "$MOUNT/kernel8.img" \
		-sd "$IMAGE" \
		-netdev user,id=net0 \
		-device usb-net,netdev=net0 \
		-append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1"

	expect -exact {raspberrypi login: }
	send -- [string cat {pi} "\n"]

	expect -exact {Password: }
	send -- [string cat {raspberry} "\n"]

	expect -exact {pi@raspberrypi}
	send -- [string cat {curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs} "\n"]

	expect -exact {pi@raspberrypi}
	send -- [string cat {wget --progress=dot https://github.com/kmamal/node-sdl/archive/refs/heads/master.tar.gz && tar xvf master.tar.gz && cd node-sdl-master} "\n"]

	expect -exact {pi@raspberrypi}
	send -- [string cat {./scripts/install-deps-raspbian.sh && GITHUB_TOKEN="$GITHUB_TOKEN" npm run release} "\n"]

	expect -exact {pi@raspberrypi}
	send -- [string cat {sudo shutdown -h now} "\n"]

	expect eof
EOF

# debug
# sudo mount -o loop,offset=272629760 "$IMAGE" "$MOUNT"
