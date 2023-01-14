#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json_schemer'
require 'parallel'
@status = 0
seen_names = []

schema = JSONSchemer.schema(File.read('tests/schema.json'))

def error(file, msg)
  @status = 1
  puts "::error file=#{file}:: #{msg}"
end

# rubocop:disable Metrics/BlockLength
Dir.glob('entries/*/*.json').each do |file|
  begin
    JSON.parse(File.read(file))
  rescue JSON::ParserError => e
    error(file, "Invalid JSON in #{file}\n#{e.full_message}")
    next
  end

  document = JSON.parse(File.read(file))

  unless schema.valid? document
    schema.validate(document).each do |v|
      type = v['type']
      tag = v['data_pointer'].split('/')[2].eql?('contact')
      a = []
      a.push()
      a.push "::error file=#{file}:: '#{v['type'].capitalize}' error in #{file}"
      a.push "- tag: #{tag}" if v['data_pointer'].split('/').length == 2
      a.push "  data: #{v['data']}" if v['details'].nil?
      a.push "  data: #{v['details']}" unless v['details'].nil?
      a.push "  expected: #{v['schema']['pattern']}" if type.eql?('pattern')
      a.push "  expected: #{v['schema']['format']}" if type.eql?('format')
      a.push "  expected: #{v['schema']['required']}" if type.eql?('required')
      a.push "  expected: only one of 'tfa' or 'contact'" if type.eql?('oneOf')
      a.push "  expected: 'tfa' to contain '#{v['schema']['contains']['const']}'" if v['type'].eql?('contains')
      a.push "  expected: either 'email' or 'form'" if type.eql?('not') && tag.eql?('contact')
      error(file,a.join("%0A"))
    end
    @status = 1
    next
  end

  domain = document.values[0]['domain']
  url = document.values[0]['url']
  default_url = "https://#{domain}"
  if !url.nil? && (url.eql?(default_url) || url.eql?("#{default_url}/"))
    error(file, "Defining the url property for #{domain} is not necessary - '#{default_url}' is the default value")
  end

  file_name = file.split('/')[2]
  expected_file_name = "#{document.values[0]['domain']}.json"

  unless file_name.eql? expected_file_name
    error(file,
          "File name should be the same as the domain name. Received: #{file_name}. Expected: #{expected_file_name}")
  end

  folder_name = file.split('/')[1]
  expected_folder_name = document.values[0]['domain'][0]

  unless folder_name.eql? expected_folder_name
    error(file,
          "Entry should be in the subdirectory with the same name as the first letter as the domain.
           Received: entries/#{folder_name}. Expected: entries/#{expected_folder_name}")
  end

  name = document.keys[0]
  if seen_names.include? name
    error(file, "An entry with the name '#{name}' already exists. Duplicate site names are not allowed.
    If this entry is not the same site, please rename '#{name}'.")
  else
    seen_names.push(name)
  end
end
# rubocop:enable Metrics/BlockLength
exit(@status)
