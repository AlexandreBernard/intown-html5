module ConsoleHelpers
  def out(msg, nl = 1)
    print "    #{msg}"
    (1..nl).each{ print "\n" }
  end
  
  def error(msg, exit = true)
    puts "    #{red("/!\\ Error:")} #{msg}\n\n\n"
    exit! if exit == true
  end
  
  def green(text)
    "\e[32m#{text}\e[0m"
  end

  def red(text)
    "\e[31m#{text}\e[0m"
  end
  
  def yellow(text)
    "\e[33m#{text}\e[0m"
  end
end