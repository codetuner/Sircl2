using System;
using System.Collections.Generic;
using System.Text;

namespace Arebis.Core.Localization
{
    public interface ILocalizationSource
    {
        LocalizationResources BuildResources();
    }
}
