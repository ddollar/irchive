$:.unshift(File.dirname(__FILE__))

require 'sinatra'
require 'web/irchive'
require 'rack/cache'

if ENV["RACK_ENV"] == 'production'
  use Rack::Cache,
    :metastore   => 'memcached://localhost:11211/irchive-meta',
    :entitystore => 'memcached://localhost:11211/irchive-body',
    :allow_reload => false,
    :allow_revalidate => false
end

run Sinatra.application