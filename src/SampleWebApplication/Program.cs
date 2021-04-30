using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SampleWebApplication
{
    public class Program
    {
        public static void Main(string[] args)
        {
            ToDoLanes.Add(new List<ToDoItem>());
            ToDoLanes.Add(new List<ToDoItem>());
            ToDoLanes.Add(new List<ToDoItem>());

            ToDoLanes[0].Add(new ToDoItem() { Name = "Shopping", Description = "Go to the super market." });
            ToDoLanes[0].Add(new ToDoItem() { Name = "Homework", Description = "Finish my homework." });
            ToDoLanes[0].Add(new ToDoItem() { Name = "Prepare lunch", Description = "Prepare todays lunch." });

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        public static List<List<ToDoItem>> ToDoLanes { get; set; } = new List<List<ToDoItem>>();


    }
}
