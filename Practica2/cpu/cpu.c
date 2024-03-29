#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/delay.h>

#include <linux/sched.h>
#include <linux/signal.h>
#include <linux/cred.h>


#define PROC_DIR "cpu_201801290"
#define INFO_FILE "info.txt"

static struct proc_dir_entry *so1cpu_proc_dir;
static struct proc_dir_entry *so1cpu_info_file;

//STRUCT FOR CPU USAGE
struct task_struct *task;
unsigned long long before_total_cpu_usage = 0;
unsigned long long after_total_cpu_usage = 0;
unsigned long long total_cpu_usage = 0;

///////////////////////////////
unsigned int interval_us = 500000;
unsigned long long start_time_ns, end_time_ns;

unsigned long long start_utime;
unsigned long long start_stime;
unsigned long long end_utime;
unsigned long long end_stime;

unsigned long long total_cpu_usage;


//STRUCTS FOR LISTING PROCESSES
struct task_struct * child;
struct list_head * lstProcess;



static int so1cpu_info_show(struct seq_file *theFile, void *v) {
    seq_printf(theFile, "{\"processes\":[");
    for_each_process(task){
        seq_printf(theFile, "{\n");
        seq_printf(theFile, "\"pid\":%d,\n", task->pid);
        seq_printf(theFile, "\"name\":\"%s\",\n", task->comm);
        seq_printf(theFile, "\"status\":\"%c\",\n", task_state_to_char(task));
        seq_printf(theFile, "\"user\":%i,\n", task->cred->uid.val);
        seq_printf(theFile, "\"children\":[");
        list_for_each(lstProcess, &(task->children)){
            child = list_entry(lstProcess, struct task_struct, sibling);
            seq_printf(theFile, "{\n");
            seq_printf(theFile, "\"pid\":%d,\n", child->pid);
            seq_printf(theFile, "\"name\":\"%s\"\n", child->comm);

            seq_printf(theFile, "},\n");
        }
        seq_printf(theFile, "{\"pid\":-1, \"name\":\"-\"}]\n},\n");
    }
    seq_printf(theFile, "{\"pid\":-1, \"name\":\"-\", \"status\":\"X\", \"user\":-1, \"children\":[]}]\n");


    //////////////////////////////////////////////CPU USAGE/////////////////////////////////////////////////////////////
    before_total_cpu_usage = 0;
    for_each_process(task) {
        before_total_cpu_usage += task->utime + task->stime;
    }
    usleep_range(interval_us, interval_us + 1000);
    after_total_cpu_usage = 0;
    for_each_process(task) {
        after_total_cpu_usage += task->utime + task->stime;
    }


    total_cpu_usage = (after_total_cpu_usage-before_total_cpu_usage) * 10 / interval_us;
    printk(KERN_INFO "Current total_cpu_usage: %llu\n", total_cpu_usage);


    seq_printf(theFile, ",\"cpu_usage\":%llu\n", total_cpu_usage);
    seq_printf(theFile, "}");

    return 0;
}

static int so1cpu_info_open(struct inode *inode, struct file *file) {
    return single_open(file, so1cpu_info_show, NULL);
}

static const struct proc_ops so1cpu_info_ops = {
        .proc_open = so1cpu_info_open,
        .proc_read = seq_read,
        .proc_lseek = seq_lseek,
        .proc_release = single_release,
};



static int __init cpu_201801290_init(void) {
    printk(KERN_INFO "Iniciando modulo. Nombre:Brian Emmanuel Riad Matus Colocho\n");

    so1cpu_proc_dir = proc_mkdir(PROC_DIR, NULL);
    if (!so1cpu_proc_dir) {
        pr_err("No se pudo crear el directorio /proc/%s\n", PROC_DIR);
        return -ENOMEM;
    }

    so1cpu_info_file = proc_create(INFO_FILE, 0, so1cpu_proc_dir, &so1cpu_info_ops);
    if (!so1cpu_info_file) {
        pr_err("No se pudo crear el archivo /proc/%s/%s\n", PROC_DIR, INFO_FILE);
        return -ENOMEM;
    }
    return 0;
}

static void __exit cpu_201801290_exit(void) {
    printk(KERN_INFO "Deteniendo modulo. Primer Semestre 20233\n");

    proc_remove(so1cpu_info_file);
    proc_remove(so1cpu_proc_dir);

}

module_init(cpu_201801290_init);
module_exit(cpu_201801290_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Brian Matus");
MODULE_DESCRIPTION("Module to read process info and cpu usage");
MODULE_VERSION("0.1");