#!/usr/bin/env bash

set -eEu -o pipefail
set -x

OS="raspios_lite_arm64"
DATE="2023-05-03"
IMAGE="$DATE-raspios-bullseye-arm64-lite.img"
MOUNT="/mnt/raspbian"

DIR="/tmp/node-sdl-rpi-qemu"
rm -rf "$DIR" || true
mkdir -p "$DIR"
cd "$DIR"
echo "Working in $DIR"

sudo apt-get update
sudo apt-get install -y xz-utils qemu-system-arm expect

wget "https://downloads.raspberrypi.org/$OS/images/$OS-$DATE/$IMAGE.xz"
unxz "$IMAGE.xz"

qemu-img resize "$IMAGE" 4G

expect -f - <<- EOF
	set timeout -1
	exp_internal 1

	spawn fdisk "$IMAGE"

	expect "Command (m for help): "
	sleep 1
	send -- "d\r"

	expect "Partition number (1,2, default 2): "
	sleep 1
	send -- "\r"

	expect "Command (m for help): "
	sleep 1
	send -- "n\r"

	expect "Select (default p): "
	sleep 1
	send -- "\r"

	expect "Partition number (2-4, default 2): "
	sleep 1
	send -- "\r"

	expect "First sector (2048-8388607, default 2048): "
	sleep 1
	send -- "532480\r"

	expect "Last sector, +/-sectors or +/-size{K,M,G,T,P} (532480-8388607, default 8388607): "
	sleep 1
	send -- "\r"

	expect "Do you want to remove the signature*"
	sleep 1
	send -- "N\r"

	expect "Command (m for help): "
	sleep 1
	send -- "w\r"

	expect eof
EOF

sudo losetup -P /dev/loop0 "$IMAGE"
sudo e2fsck -fa /dev/loop0p2 || true
sudo resize2fs /dev/loop0p2
sudo losetup -d /dev/loop0

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

	expect "login: "
	sleep 1
	send -- "pi\r"

	expect "Password: "
	sleep 1
	send -- "raspberry\r"

	expect "pi@raspberrypi*"
	sleep 1
	send -- "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs\r"

	expect "pi@raspberrypi*"
	sleep 1
	send -- "wget https://github.com/kmamal/node-sdl/archive/refs/heads/master.tar.gz && tar xvf master.tar.gz && cd node-sdl-master\r"

	expect "pi@raspberrypi*"
	sleep 1
	send -- "./scripts/install-deps-raspbian.sh && GITHUB_TOKEN="$GITHUB_TOKEN" npm run release\r"

	expect "pi@raspberrypi*"
 	sleep 1
	send -- "sudo shutdown -h now\r"

	expect eof
EOF

# debug
# sudo mount -o loop,offset=272629760 "$IMAGE" "$MOUNT"
