import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  currentYear: number; // Stores the current year
  currentMonth: number; // Stores the current month 
  daysInMonth: any[]; // Array to store the days in the current month
  holidays: any[]; // Array to store holidays
  form: FormGroup;
  showCalendar: boolean = false;
  selectedIndex: number | null = null;
  months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  selectedDate: Date | null = null;
  weekDays: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.daysInMonth = [];
    this.holidays = [];
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadHolidays().subscribe(() => {
      this.generateCalendar();
    });
  }

  // Initialize the form 
  initForm(): FormGroup {
    return this.fb.group({
      date: [''],
    });
  }

  // Load holidays from an external file
  loadHolidays() {
    return this.http.get('assets/holidays.txt', { responseType: 'text' }).pipe(
      map((data) => {
        this.holidays = data.split('\n').map((line) => {
          const [date, recurring] = line.split(' ');
          return { date: new Date(date), recurring: recurring === 'true\r' };
        });
      })
    );
  }

  // Generate the calendar for the current month and year
  generateCalendar() {
    const startOfMonth = new Date(this.currentYear, this.currentMonth, 1); // First day of the month
    
    const endOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0); // Last day of the month

    const startDayOfWeek = startOfMonth.getDay();

    this.daysInMonth = [];
    const startDayOfWeekShift = startDayOfWeek === 0 ? 7 : startDayOfWeek;

    // Fill initial empty days
    for (let i = 1; i < startDayOfWeekShift; i++) {
      this.daysInMonth.push(null);
    }

    // Populate the days in the month with flags marking whether the day is sunday or a holiday
    for (
      let day = new Date(startOfMonth);
      day <= endOfMonth;
      day.setDate(day.getDate() + 1)
    ) {
      const { isHoliday } = this.isHoliday(day);
      this.daysInMonth.push({
        date: new Date(day),
        isHoliday,
        isSunday: day.getDay() === 0,
      });
    }

    // Highlight the selected date 
    if (this.selectedDate) {
      this.selectedIndex = this.daysInMonth.findIndex(
        (day) => day && day.date.getTime() === this.selectedDate!.getTime()
      );
    }
  }

  // Check if a given date is a holiday
  isHoliday(day: Date) {
    for (let holiday of this.holidays) {
      if (holiday.recurring) { //for holidays that are recurring
        if (
          day.getDate() === holiday.date.getDate() &&
          day.getMonth() === holiday.date.getMonth()
        ) {
          return { isHoliday: true };
        }
      } else { // for holidays that aren't recurring
        if (
          day.getDate() === holiday.date.getDate() &&
          day.getMonth() === holiday.date.getMonth() &&
          day.getFullYear() === holiday.date.getFullYear()
        ) {
          return { isHoliday: true };
        }
      }
    }
    return { isHoliday: false };
  }

  // Handle changes in the month selection field
  onMonthChange(event: any) {
    this.selectedIndex = null;
    this.currentMonth = +event.target.value; // Ensuring the value is a number
    this.generateCalendar();
  }

  // Handle changes in the year input field
  onYearChange(event: any) {
    this.selectedIndex = null;
    this.currentYear = +event.target.value; // Ensuring the value is a number
    this.generateCalendar();
  }

  // Handle changes in the date input field
  onDateInputChange(event: any) {
    const [day, month, year] = event.target.value.split('/');
    const inputDate = new Date(+year, +month - 1, +day);
    if (!isNaN(inputDate.getTime())) {
      this.currentYear = inputDate.getFullYear();
      this.currentMonth = inputDate.getMonth();
      this.generateCalendar();
      this.selectDate({ date: inputDate });
      this.showCalendar = false;
    }
  }

  // Toggle the visibility of the calendar
  toggleCalendar(event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // Prevent the click event from propagating to the input field
    }
    this.showCalendar = !this.showCalendar;
  }

  // Create a form group with the selected date
  setForm(date: any): FormGroup {
    const form = this.fb.group({
      date: [date],
    });
    return form;
  }

  // Select a date from the calendar
  selectDate(day: any) {
    if (day) {
      const selectedDate = day.date;
      this.selectedDate = selectedDate;

      // Find the index of the selected date in the daysInMonth array
      this.selectedIndex = this.daysInMonth.findIndex(
        (d) => d && d.date.getTime() === selectedDate.getTime()
      );

      // Format the selected date into a string with the format "DD/MM/YYYY"
      const dayString = `${('0' + selectedDate.getDate()).slice(-2)}/${(
        '0' +
        (selectedDate.getMonth() + 1)
      ).slice(-2)}/${selectedDate.getFullYear()}`;

      // Update the form with the formatted date string
      this.form = this.setForm(dayString);
      this.showCalendar = false;
    }
  }

  // Handle input click to close the calendar if open
  onInputClick() {
    if (this.showCalendar) {
      this.showCalendar = false;
    }
  }
}
