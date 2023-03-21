#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>

#include <linux/sysinfo.h>
#include <linux/mm.h>


#define PROC_DIR "ram_201801290"
#define INFO_FILE "info.txt"

static struct proc_dir_entry *so1ram_proc_dir;
static struct proc_dir_entry *so1ram_info_file;
const int megabyte = 1024 * 1024;


///////////////////////////////
struct sysinfo sys_info;



static int so1ram_info_show(struct seq_file *theFile, void *v) {
    si_meminfo(&sys_info);
    seq_printf(theFile, "{");
    seq_printf(theFile, "\"total_ram\":%llu,",sys_info.totalram *(unsigned long long)sys_info.mem_unit / megabyte);
    seq_printf(theFile, "\"free_ram\":%llu,",sys_info.freeram *(unsigned long long)sys_info.mem_unit / megabyte);
    seq_printf(theFile, "\"buffered_ram\":%llu,",sys_info.bufferram *(unsigned long long)sys_info.mem_unit / megabyte);
    seq_printf(theFile, "\"cached_ram\":%llu",sys_info.sharedram *(unsigned long long)sys_info.mem_unit / megabyte);
    seq_printf(theFile, "}");
    return 0;
}

static int so1ram_info_open(struct inode *inode, struct file *file) {
    return single_open(file, so1ram_info_show, NULL);
}

static const struct proc_ops so1ram_info_ops = {
        .proc_open = so1ram_info_open,
        .proc_read = seq_read,
        .proc_lseek = seq_lseek,
        .proc_release = single_release,
};



static int __init ram_201801290_init(void) {
    printk(KERN_INFO "Iniciando modulo. Carnet:201801290\n");

    so1ram_proc_dir = proc_mkdir(PROC_DIR, NULL);
    if (!so1ram_proc_dir) {
        pr_err("No se pudo crear el directorio /proc/%s\n", PROC_DIR);
        return -ENOMEM;
    }

    so1ram_info_file = proc_create(INFO_FILE, 0, so1ram_proc_dir, &so1ram_info_ops);
    if (!so1ram_info_file) {
        pr_err("No se pudo crear el archivo /proc/%s/%s\n", PROC_DIR, INFO_FILE);
        return -ENOMEM;
    }
    return 0;
}

static void __exit ram_201801290_exit(void) {
    printk(KERN_INFO "Deteniendo modulo. Curso:Sistemas Operativos 1\n");
    proc_remove(so1ram_info_file);
    proc_remove(so1ram_proc_dir);
}

module_init(ram_201801290_init);
module_exit(ram_201801290_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Brian Matus");
MODULE_DESCRIPTION("Module to read RAM usage");
MODULE_VERSION("0.1");