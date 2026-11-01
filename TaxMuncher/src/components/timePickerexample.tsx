import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { useState } from "react";

//THIS IS FROM THE IMAGEPICKER EXAMPLE IN THE EXPO DOCUMENTATION
//THIS IS NOT SUPPOSED TO BE USED, IT'S JUST FOR TESTING PURPOSES TO SEE IF THE IMAGEPICKER WORKS
// Link: https://docs.expo.dev/versions/latest/sdk/datetimepicker/
export default function TimePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents>
      <DateTimePicker
        onDateSelected={(date) => {
          setSelectedDate(date);
        }}
        displayedComponents="hourAndMinute"
        initialDate={selectedDate.toISOString()}
        variant="picker"
      />
    </Host>
  );
}
