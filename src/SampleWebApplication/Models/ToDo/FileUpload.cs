using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models.ToDo
{
    public class FileUpload
    {
        public List<IFormFile> FormFiles { get; set; }
    }
}
