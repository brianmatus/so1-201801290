KERNELRELEASE = $(shell uname -r)
EXTRA_CFLAGS += -I/lib/modules/$(shell uname -r)/build/include


obj-m += ram.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
	mkdir -p $(PWD)/compiled
	mv $(PWD)/.ram.ko.cmd $(PWD)/compiled/
	mv $(PWD)/.ram.mod.cmd $(PWD)/compiled/
	mv $(PWD)/.ram.mod.o.cmd $(PWD)/compiled/
	mv $(PWD)/.ram.o.cmd $(PWD)/compiled/
	mv $(PWD)/.Module.symvers.cmd $(PWD)/compiled/
	mv $(PWD)/.modules.order.cmd $(PWD)/compiled/
	mv $(PWD)/ram.mod $(PWD)/compiled/
	mv $(PWD)/ram.mod.c $(PWD)/compiled/
	mv $(PWD)/ram.mod.o $(PWD)/compiled/
	mv $(PWD)/ram.o $(PWD)/compiled/
	mv $(PWD)/Module.symvers $(PWD)/compiled/
	mv $(PWD)/modules.order $(PWD)/compiled/


clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean