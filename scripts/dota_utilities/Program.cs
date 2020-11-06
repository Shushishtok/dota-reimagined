/*
    To run this script:
    1. Install .Net Core SDK from https://dotnet.microsoft.com/download
    2. In your shell, navigate to the directory where Program.cs lies and run "dotnet run"
    NOTE: YOU ABSOLUTELY NEED "abilities_english.txt" and "npc_abilities.txt" TO BE IN THE SAME DIRECTORY WITH Program.cs
*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.IO;

namespace DOTA_UTILITIES
{

    class Constants
    {
        // Filenames
        public const string file_input_talents = "abilities_english.txt";
        public const string file_output_talents = "talents_strings.txt";
        public const string file_input_abilities = "npc_abilities.txt";
        public const string file_output_abilities = "icons_strings.txt";
    }

    public static class StringExtentions
    {
        public static bool ContainsCaseInsensitive(this string source, string value, StringComparison comparisonType = StringComparison.InvariantCultureIgnoreCase)
        {
            return source?.IndexOf(value, comparisonType) >= 0;
        }

        public static List<int> FindAllIndexesOf(string s, char c)
        {
            List<int> occurences = new List<int>();
            for (int i = 0; i < s.Length; i++)
            {
                if (s[i] == c)
                {
                    occurences.Add(i);
                }
            }
            return occurences;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            ProcessTalents(Constants.file_input_talents);
            ProcessAbilityIcons(Constants.file_input_abilities);
            Console.WriteLine("Success!");
            Thread.Sleep(TimeSpan.FromSeconds(1f));
        }

        public static void ProcessTalents(string name)
        {
            // Load talents file
            string[] talents_txt = File.ReadAllLines(name);
            List<string> kv_pairs = new List<string>();

            // Parse each line
            foreach (var line in talents_txt)
            {
                // If it contains talent specific substring
                if (line.ContainsCaseInsensitive("DOTA_Tooltip_ability_special_bonus_"))
                {
                    // Split kv's and process them
                    List<string> kvp = new List<string>();
                    int[] indexes = StringExtentions.FindAllIndexesOf(line, '\"').ToArray();
                    kvp.Add(line.Substring(indexes[0], indexes[1] - indexes[0] + 1));
                    kvp.Add(line.Substring(indexes[2], indexes[3] - indexes[2] + 1));

                    kvp[1] = kvp[1].Replace("{s:", "%");
                    kvp[1] = kvp[1].Replace("}", "%");
                    kvp[1] = kvp[1].Replace("%%", "%%%");

                    // Format result string
                    string result = String.Format("{0, -85}     {1}", kvp[0], kvp[1]);

                    // Add to resulting file
                    kv_pairs.Add(result);
                }
            }

            // Write the resulting file
            File.WriteAllLines(Constants.file_output_talents, kv_pairs.ToArray());
        }

        

        public static void ProcessAbilityIcons(string name)
        {
            // Load abilities file
            string[] talents_txt = File.ReadAllLines(name);
            List<string> kv_pairs = new List<string>();

            // Init current ability and special bonus scope
            string current_ability = "WHOOPS - I HOPE NOBODY SAW THAT";
            bool is_bonus = false;

            StringBuilder sb = new StringBuilder();

            // Parse each line
            foreach (var line in talents_txt)
            {


                // If current line contains only one key - it is an ability name
                if (StringExtentions.FindAllIndexesOf(line, '\"').Count == 2)
                {
                    // If current line contains talent specific string - set current ability and raise special bonus scope flag
                    if (line.ContainsCaseInsensitive("special_bonus_"))
                    {
                        current_ability = line.Trim(' ', '\t');
                        is_bonus = true;
                    }
                }

                // If we are in special bonus scope
                if (is_bonus)
                {
                    // Check if current line contains Ability Draft linked ability
                    if (line.ContainsCaseInsensitive("ad_linked_ability"))
                    {
                        // Split kv's and process them
                        List<string> kvp = new List<string>();
                        int[] indexes = StringExtentions.FindAllIndexesOf(line, '\"').ToArray();
                        kvp.Add(line.Substring(indexes[0], indexes[1] - indexes[0] + 1));
                        kvp.Add(line.Substring(indexes[2], indexes[3] - indexes[2] + 1));

                        // Append current ability chunk to the result
                        sb.AppendLine(current_ability);
                        sb.AppendLine("{");
                        sb.AppendFormat("\t{0}\t{1}\n", "\"AbilityTextureName\"", kvp[1]);
                        sb.AppendLine("}");
                        sb.AppendLine();

                        // Reset special bonus scope flag
                        is_bonus = false;
                    }
                }
            }

            // Write the resulting file
            File.WriteAllText(Constants.file_output_abilities, sb.ToString());
        }
    }

}
