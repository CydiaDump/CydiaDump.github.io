document.write('<div id="lcd">');

var locale = CFLocaleCopyCurrent();
var now = CFDateCreate(NULL, CFAbsoluteTimeGetCurrent());
var formatter = CFDateFormatterCreate(NULL, locale, kCFDateFormatterNoStyle, kCFDateFormatterNoStyle);
CFRelease(locale);

CFDateFormatterSetFormat(formatter, UIDateFormatStringForFormatType(UINoAMPMTimeFormat));
var time = CFDateFormatterCreateStringWithDate(NULL, formatter, now);
document.write('<h1>');
document.write(time);
document.write('</h1>');
CFRelease(time);

CFDateFormatterSetFormat(formatter, UIDateFormatStringForFormatType(UIWeekdayNoYearDateFormat));
var date = CFDateFormatterCreateStringWithDate(NULL, formatter, now);
document.write('<h2>');
document.write(date);
document.write('</h2>');
CFRelease(date);

CFRelease(formatter);
CFRelease(now);

document.write('</div>');
