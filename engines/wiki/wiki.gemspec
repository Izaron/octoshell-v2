$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "wiki/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "wiki"
  s.version     = Wiki::VERSION
  s.authors     = ["Dmitry Koprov"]
  s.email       = ["dmitry.koprov@gmail.com"]
  s.homepage    = "https://github.com/octoshell/octoshell-v2"
  s.summary     = "A wiki engine for octoshell"
  s.description = "Provides a wiki engine with markdown support"
  s.license     = "MIT"
  s.platform = 'java' if RUBY_ENGINE == 'jruby'

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 5.0"
  s.add_dependency "activerecord-jdbcpostgresql-adapter" if /java/.match(RUBY_PLATFORM)
  s.add_dependency "pg", "~> 0.18" unless /java/.match(RUBY_PLATFORM)
  s.add_dependency "slim"
  #  s.add_dependency "activerecord-jdbcpostgresql-adapter"
  # s.add_dependency "bootstrap_form", ">= 4.2.0"
  # s.add_dependency "maymay"

  s.add_development_dependency "annotate"

  s.test_files = Dir["spec/**/*"]
end
