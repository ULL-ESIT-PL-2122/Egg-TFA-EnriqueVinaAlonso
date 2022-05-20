const RED     = "\033[31m";
const BLUE    = '\033[34m'; // \033 begins the escape sequence
const DEFAULT = '\033[39m'; // [ indicates the color
                            // 34 is the foreground color blue
                            //  m indicates the end of the setting
const blue = (str) => BLUE+str+DEFAULT;
const red = (str) => RED+str+DEFAULT;

module.exports = {BLUE, RED, DEFAULT, blue, red};
