for (var i = 100; i <= 201; i++) {
  var lo = i % 3 == 0, li = i % 5 == 0;
  console.log(lo ? li ? "FizzBuzz" : "Fizz" : li ? "Buzz" : i);
}