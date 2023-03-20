KERNELRELEASE = $(shell uname -r)
EXTRA_CFLAGS += -I/lib/modules/$(shell uname -r)/build/include


obj-m += cpu.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
	mkdir -p $(PWD)/compiled
	mv $(PWD)/.cpu.ko.cmd $(PWD)/compiled/
	mv $(PWD)/.cpu.mod.cmd $(PWD)/compiled/
	mv $(PWD)/.cpu.mod.o.cmd $(PWD)/compiled/
	mv $(PWD)/.cpu.o.cmd $(PWD)/compiled/
	mv $(PWD)/.Module.symvers.cmd $(PWD)/compiled/
	mv $(PWD)/.modules.order.cmd $(PWD)/compiled/
	mv $(PWD)/cpu.mod $(PWD)/compiled/
	mv $(PWD)/cpu.mod.c $(PWD)/compiled/
	mv $(PWD)/cpu.mod.o $(PWD)/compiled/
	mv $(PWD)/cpu.o $(PWD)/compiled/
	mv $(PWD)/Module.symvers $(PWD)/compiled/
	mv $(PWD)/modules.order $(PWD)/compiled/


clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean